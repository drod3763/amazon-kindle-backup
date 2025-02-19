import { createWriteStream } from "fs";
import { join } from "path";
import https from "node:https";
import type { TokenInfo, Device } from "./types.js";
import { URLS } from "./constants";
import type { Page } from "playwright";

const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "3");
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY || "5000");
const DEFAULT_BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "3");
const DEFAULT_BATCH_DELAY = parseInt(process.env.BATCH_DELAY || "1000");

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadFile(
  url: string,
  headers: Record<string, string>,
  outputDir: string,
  asin: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tempFile = createWriteStream(join(outputDir, `${asin}.tmp`));

    const request = https.get(url, { headers }, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error("Redirect location not found"));
          return;
        }

        // Close current file stream
        tempFile.close();

        // Follow redirect with same headers
        downloadFile(redirectUrl, headers, outputDir, asin)
          .then(resolve)
          .catch(reject);

        return;
      }

      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Failed to download: ${response.statusCode} ${response.statusMessage}`
          )
        );
        return;
      }

      // Get original filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${asin}.azw`;

      if (contentDisposition) {
        const matches = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
        if (matches && matches[1]) {
          // Replace forward slashes and backslashes with underscores
          filename = decodeURIComponent(matches[1]).replace(/[\/\\]/g, "_");
        }
      }

      // Create final write stream with correct filename
      const file = createWriteStream(join(outputDir, filename));
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        // Clean up temp file if it exists
        if (tempFile) {
          tempFile.close();
        }
        resolve();
      });

      file.on("error", (error) => {
        file.close();
        if (tempFile) {
          tempFile.close();
        }
        reject(error);
      });
    });

    request.on("error", (error) => {
      tempFile.close();
      reject(error);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      tempFile.close();
      reject(new Error("Request timeout"));
    });
  });
}

async function downloadBatch(
  page: Page,
  tokens: TokenInfo,
  device: Device,
  asins: string[],
  cookieHeader: string
): Promise<void> {
  const downloadPromises = asins.map(async (asin) => {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        console.log(
          `Fetching ${asin}... (attempt ${attempts + 1}/${MAX_RETRIES})`
        );

        const params = new URLSearchParams({
          type: "EBOK",
          key: asin,
          fsn: device.deviceSerialNumber!,
          device_type: device.deviceType,
          customerId: tokens.customerId,
          authPool: "Amazon",
        });

        const url = `${URLS.CDN}?${params}`;
        const outputDir = process.env.OUTPUT_DIR || "books";

        const headers = {
          Cookie: cookieHeader,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/x-mobipocket-ebook",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        };

        await downloadFile(url, headers, outputDir, asin);
        console.log(`✓ Downloaded ${asin}`);
        return;
      } catch (error) {
        attempts++;
        if (error instanceof Error) {
          console.error(
            `Attempt ${attempts} failed for ${asin}:`,
            error.message
          );
        }

        if (attempts === MAX_RETRIES) {
          console.error(
            `Failed to download ${asin} after ${MAX_RETRIES} attempts`
          );
          return;
        }

        const delay = RETRY_DELAY * Math.pow(2, attempts - 1);
        console.log(`Waiting ${delay}ms before next attempt...`);
        await wait(delay);
      }
    }
  });

  await Promise.all(downloadPromises);
}

export async function downloadBooks(
  page: Page,
  tokens: TokenInfo,
  device: Device,
  asins: string[],
  batchSize: number = DEFAULT_BATCH_SIZE
): Promise<void> {
  if (!device.deviceSerialNumber) {
    throw new Error("Selected device does not have a serial number");
  }

  const totalBatches = Math.ceil(asins.length / batchSize);
  console.log(
    `Downloading ${asins.length} books in ${totalBatches} batches of ${batchSize}...`
  );

  // Get current cookies once for all downloads
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // Process in batches
  for (let i = 0; i < asins.length; i += batchSize) {
    const currentBatch = Math.floor(i / batchSize) + 1;
    const batch = asins.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${currentBatch}/${totalBatches}...`);

    await downloadBatch(page, tokens, device, batch, cookieHeader);

    // Wait between batches if not the last batch
    if (currentBatch < totalBatches) {
      console.log(
        `Waiting ${DEFAULT_BATCH_DELAY / 1000} seconds before batch ${
          currentBatch + 1
        }/${totalBatches}...`
      );
      await wait(DEFAULT_BATCH_DELAY);
    }
  }

  console.log("\nAll downloads complete!");
}
