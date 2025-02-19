import type { Device, Settings, TokenInfo } from "./lib/types.js";
import { chromium, type Browser } from "playwright";
import { mkdirSync, existsSync } from "node:fs";
import createSession from "./lib/create-session.js";
import { getDevices, getOwnershipData } from "./lib/apis.js";
import { downloadBooks } from "./lib/download-books.js";
import { createInterface } from "node:readline";
import {
  loadBooksCache,
  saveBooksCache,
  loadDevicesCache,
  saveDevicesCache,
} from "./lib/cache.js";

async function promptForDevice(devices: Device[]): Promise<Device> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nAvailable devices:");
  devices.forEach((device, i) => {
    console.log(
      `${i}. ${device.deviceAccountName} (${device.deviceTypeString})`
    );
  });

  return new Promise((resolve) => {
    rl.question("\nSelect device number: ", (answer) => {
      rl.close();
      const index = parseInt(answer);
      if (isNaN(index) || index < 0 || index >= devices.length) {
        console.log("Invalid selection, using first device");
        resolve(devices[0]);
      } else {
        resolve(devices[index]);
      }
    });
  });
}

async function main() {
  const settings: Settings = {
    email: process.env.AMAZON_EMAIL || "",
    password: process.env.AMAZON_PASSWORD || "",
    outputDir: process.env.DOWNLOAD_DIR || "./books",
    showBrowser: process.env.SHOW_BROWSER === "false",
    forceRefresh: process.env.FORCE_REFRESH === "true",
  };

  if (!existsSync(settings.outputDir)) {
    mkdirSync(settings.outputDir);
  }

  // Try to load from cache first
  let books = loadBooksCache();
  let devices = loadDevicesCache();
  let asins: string[] = [];

  const browser: Browser = await chromium.launch({
    headless: settings.showBrowser,
  });

  try {
    const context = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 1280, height: 720 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    const tokens = await createSession(page);

    if (!books || settings.forceRefresh) {
      console.log(
        settings.forceRefresh
          ? "Force refresh requested"
          : "No books cache found"
      );
      console.log("Fetching books from Amazon...");
      books = await getOwnershipData(page, tokens);
      saveBooksCache(books);
    } else {
      console.log(`Loaded ${books.length} books from cache`);
    }

    asins = books.map((book) => book.asin);

    if (!devices || settings.forceRefresh) {
      console.log(
        settings.forceRefresh
          ? "Force refresh requested"
          : "No devices cache found"
      );
      console.log("Fetching devices from Amazon...");
      devices = await getDevices(page, tokens);
      saveDevicesCache(devices);
    } else {
      console.log(`Loaded ${devices.length} devices from cache`);
    }

    const device = await promptForDevice(devices);

    if (device.deviceSerialNumber === undefined) {
      throw new Error("No valid device found. Exiting.");
    }

    console.log(`\nUsing device: ${device.deviceAccountName}`);
    await downloadBooks(page, tokens, device, asins);

    console.log(
      `\nDownload complete! Use DeDRM tools with serial number: ${device.deviceSerialNumber}`
    );
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
