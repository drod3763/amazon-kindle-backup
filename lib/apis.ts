import type {
  TokenInfo,
  Device,
  BookResponse,
  BookItem,
  DeviceResponse,
} from "./types";
import { URLS, API } from "./constants";
import type { Page } from "playwright";

export async function getDevices(
  page: Page,
  tokens: TokenInfo
): Promise<Device[]> {
  console.log("Fetching devices...");
  const result: DeviceResponse = await page.evaluate(
    async ({ tokens, URLS }) => {
      const response = await fetch(URLS.CD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "anti-csrftoken-a2z": tokens.csrfToken,
          "User-Agent": navigator.userAgent,
        },
        credentials: "include",
        body: new URLSearchParams({
          data: JSON.stringify({ param: { GetDevices: {} } }),
          csrfToken: tokens.csrfToken,
        }).toString(),
      });

      return await response.json();
    },
    { tokens, URLS }
  );

  return result.GetDevices.devices.filter(
    (device: Device) => "deviceSerialNumber" in device
  );
}

export async function getOwnershipData(
  page: Page,
  tokens: TokenInfo
): Promise<BookItem[]> {
  console.log("Fetching books...");
  const OwnershipData: BookItem[] = [];
  let startIndex = 0;

  while (true) {
    const result: BookResponse = await page.evaluate(
      async ({ startIndex, tokens, API, URLS }) => {
        const dataParams = {
          param: {
            OwnershipData: {
              sortOrder: API.SORT_ORDER,
              sortIndex: API.SORT_INDEX,
              startIndex,
              batchSize: API.BATCH_SIZE,
              contentType: API.CONTENT_TYPE,
              itemStatus: API.ITEM_STATUS,
              originType: API.ORIGIN_TYPE,
            },
          },
        };

        const response = await fetch(URLS.CD_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "anti-csrftoken-a2z": tokens.csrfToken,
            "User-Agent": navigator.userAgent,
          },
          credentials: "include",
          body: new URLSearchParams({
            data: JSON.stringify(dataParams),
            clientId: "MYCD_WebService",
            csrfToken: tokens.csrfToken,
          }).toString(),
        });

        return await response.json();
      },
      { startIndex, tokens, API, URLS }
    );

    const { hasMoreItems, items } = result.OwnershipData;

    OwnershipData.push(...items);

    if (!hasMoreItems) break;
    startIndex += API.BATCH_SIZE;
  }

  console.log(`\nTotal books found: ${OwnershipData.length}`);
  return OwnershipData;
}
