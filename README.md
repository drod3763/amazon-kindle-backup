# Amazon Kindle Backup Tool

This is a Kindle backup tool that downloads all your Kindle books and saves them to a local directory.

## Usage

1. First remove any/all passkeys from your Amazon account. The appearance of a passkey will cause the script to fail.
2. Install [bun](https://bun.sh/) if you haven't already.
3. Update the .env file with your desired settings
4. Open a terminal and install all the dependencies by running:

```bash
bun install
```

4. To run the script:

```bash
bun start
```

# Notes

- It will prompt for your OTP token if you have 2FA enabled.
- You will also be asked to choose your device if you have multiple devices.
- This code comes with no warranty. Use at your own risk.
- This code is not affiliated with Amazon in any way. It is a personal project that I use to backup my Kindle books.

# Troubleshooting

If you encounter an issue logging in, change SHOW_BROWSER to `true` in `.env.local` to see the browser window. This will help you debug the issue. I've encountered a Bluetooth Permission issue on MacOS that was resolved by giving Google Chrome permission to use Bluetooth.
