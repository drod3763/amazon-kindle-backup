# amazon-kindle-backup

This is a Kindle backup tool that downloads all your Kindle books and saves them to a local directory.

## Usage

1. First remove any/all passkeys from your Amazon account. The appearance of a passkey will cause the script to fail.
2. Make a copy of `.env` as `.env.local` file in the root directory with your content as defined below.:

```
AMAZON_EMAIL: Your email
AMAZON_PASSWORD: Your amazon password. Enclose in double quotes if it contains special characters. Some characters may need to be escaped with a \ (ex. $).
OUTPUT_DIR: The directory where you want to save the books. Default is `./books`.
SHOW_BROWSER: Set to `true` to show the browser window. Default is `false`. Useful for debugging.
```

3. Install dependencies:

```bash
bun install
```

4. To run:

```bash
bun run index.ts
```

# Notes

It will prompt for your OTP token if you have 2FA enabled. You will also be asked to choose your device if you have multiple devices.

# Troubleshooting

If you encounter an issue logging in, change SHOW_BROWSER to `true` in `.env.local` to see the browser window. This will help you debug the issue. I've encountered a Bluetooth Permission issue on MacOS that was resolved by giving Google Chrome permission to use Bluetooth.
