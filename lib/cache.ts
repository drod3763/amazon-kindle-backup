import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { BookItem, Device } from "./types.js";

const CACHE_DIR = "cache";
const BOOKS_CACHE_FILE = join(CACHE_DIR, "books.json");
const DEVICES_CACHE_FILE = join(CACHE_DIR, "devices.json");

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR);
  }
}

export function loadBooksCache(): BookItem[] | null {
  try {
    ensureCacheDir();
    if (existsSync(BOOKS_CACHE_FILE)) {
      const data = readFileSync(BOOKS_CACHE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Failed to load books cache:", error);
  }
  return null;
}

export function saveBooksCache(books: BookItem[]): void {
  try {
    ensureCacheDir();
    writeFileSync(BOOKS_CACHE_FILE, JSON.stringify(books, null, 2));
  } catch (error) {
    console.warn("Failed to save books cache:", error);
  }
}

export function loadDevicesCache(): Device[] | null {
  try {
    ensureCacheDir();
    if (existsSync(DEVICES_CACHE_FILE)) {
      const data = readFileSync(DEVICES_CACHE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Failed to load devices cache:", error);
  }
  return null;
}

export function saveDevicesCache(devices: Device[]): void {
  try {
    ensureCacheDir();
    writeFileSync(DEVICES_CACHE_FILE, JSON.stringify(devices, null, 2));
  } catch (error) {
    console.warn("Failed to save devices cache:", error);
  }
}
