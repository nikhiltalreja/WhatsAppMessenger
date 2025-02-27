# WhatsApp Automation Tool

A tool to manage WhatsApp message templates and send messages through WhatsApp Web.

## Local Development Setup

### Requirements
- Node.js (version 18 or later)
- Chrome or Chromium browser
- Git

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whatsapp-automation.git
cd whatsapp-automation
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open `http://localhost:5000` in your browser

### Using the App
1. Click the "Connect" button in the header
2. A Chrome window will open with WhatsApp Web
3. Scan the QR code with your phone's WhatsApp app
4. After connecting, you can:
   - Add contacts and templates
   - Select a contact and template
   - Send messages through WhatsApp Web

### Development Notes
- All data is stored in memory - it will be cleared when you restart the server
- The Chrome window will stay open while you're connected
- If the connection times out, just click "Connect" again

### Troubleshooting
- If the Chrome window is too small, you can resize it manually
- Make sure you have Chrome or Chromium installed in a standard location
- If WhatsApp Web doesn't load, try disconnecting and connecting again