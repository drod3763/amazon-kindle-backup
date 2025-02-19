import type { Page } from "playwright";
import { type TokenInfo } from "./types";
import { URLS, SELECTORS, REGEX } from "./constants.js";

export default async function createSession(page: Page): Promise<TokenInfo> {
  console.log("Loading login page...");
  await page.goto(URLS.LOGIN);
  await page.waitForLoadState("networkidle");

  console.log("Entering email...");
  await page.fill(SELECTORS.LOGIN.EMAIL_INPUT, process.env.AMAZON_EMAIL!);
  await page.waitForTimeout(1000);
  await page.click(SELECTORS.LOGIN.CONTINUE_BUTTON);
  await page.waitForLoadState("networkidle");

  console.log("Entering password...");
  await page.fill(SELECTORS.LOGIN.PASSWORD_INPUT, process.env.AMAZON_PASSWORD!);
  await page.waitForTimeout(1000);
  await page.click(SELECTORS.LOGIN.SUBMIT_BUTTON);
  await page.waitForLoadState("networkidle");

  // Handle 2FA if needed - with proper waiting
  console.log("Checking for 2FA...");
  try {
    const twoFactorSelector = await page.waitForSelector(
      SELECTORS.LOGIN.MFA_CODE_INPUT,
      {
        timeout: 5000,
        state: "visible",
      }
    );

    if (twoFactorSelector) {
      console.log("Two-factor authentication required.");
      const otp = await prompt("Enter your 2FA code: ");
      if (!otp) throw new Error("OTP code is required");

      await page.fill(SELECTORS.LOGIN.MFA_CODE_INPUT, otp);
      await page.click(SELECTORS.LOGIN.MFA_SUBMIT_BUTTON);
      await page.waitForLoadState("networkidle");
    }
  } catch (error) {
    console.log("No 2FA required, continuing...");
  }

  const tokens = await getCSRFTokens(page);

  if (!tokens) {
    throw new Error("Failed to extract tokens after multiple attempts");
  }

  return tokens;
}

async function getCSRFTokens(page: Page) {
  console.log("Getting CSRF token");
  await page.goto(URLS.DIGITAL_CONTENT);

  // Enhanced waiting strategy
  await Promise.all([
    page.waitForLoadState("domcontentloaded"),
    page.waitForLoadState("networkidle"),
  ]);

  // Add retry logic for token extraction
  let retryCount = 0;
  const maxRetries = 3;
  let tokens: TokenInfo | null = null;

  while (retryCount < maxRetries && !tokens) {
    try {
      tokens = await page.evaluate(
        ({ CSRF_TOKEN, CUSTOMER_ID }) => {
          const scriptContent = Array.from(
            document.getElementsByTagName("script")
          )
            .map((script) => script.textContent || "")
            .join("\n");

          const csrfMatch = scriptContent.match(CSRF_TOKEN);
          const customerIdMatch = scriptContent.match(CUSTOMER_ID);

          if (!csrfMatch?.[1] || !customerIdMatch?.[1]) {
            return null;
          }

          return {
            csrfToken: csrfMatch[1],
            customerId: customerIdMatch[1],
          };
        },
        { CSRF_TOKEN: REGEX.CSRF_TOKEN, CUSTOMER_ID: REGEX.CUSTOMER_ID }
      );

      if (!tokens) {
        console.log(`Attempt ${retryCount + 1}: Waiting for tokens...`);
        await page.waitForTimeout(2000);
        retryCount++;
      }
    } catch (error) {
      console.log(`Attempt ${retryCount + 1} failed: ${error}`);
      await page.waitForTimeout(2000);
      retryCount++;
    }
  }

  return tokens;
}
