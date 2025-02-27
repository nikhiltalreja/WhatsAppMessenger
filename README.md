# WhatsApp Automation Tool

A simple tool to manage WhatsApp message templates and send messages through WhatsApp Web.

## Quick Setup

### Requirements
- Node.js (version 18 or later)
- Chrome or Chromium browser installed on your system

### Installation
1. Clone or download this repository
2. Open a terminal in the project folder
3. Install dependencies:
```bash
npm install
```
4. Start the application:
```bash
npm run dev
```
5. Open `http://localhost:5000` in your browser

### Using the App
1. Click "Connect" in the header
2. When prompted, scan the WhatsApp QR code with your phone
3. Start sending messages:
   - Add contacts and templates using the interface
   - Select a contact and template
   - Click "Send" to send your message

### Troubleshooting
- Make sure Chrome/Chromium is installed on your system
- If the QR code doesn't appear, try disconnecting and connecting again
- Ensure WhatsApp is properly set up on your phone


### Note
- Messages are sent through WhatsApp Web
- All data is stored in memory and will be cleared when the server restarts