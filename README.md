# WhatsApp Automation Tool

A simple tool to manage WhatsApp message templates and send messages through WhatsApp Web.

## Quick Setup

### Requirements
- Node.js (version 18 or later)
- Chrome or Chromium browser installed on your system

### Installation
1. Create the project structure:
```bash
mkdir whatsapp-automation
cd whatsapp-automation
mkdir -p client/src/components client/src/lib client/src/pages shared server
```

2. Download all project files (check the files section below)

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

## Project Files

### Core Files (Copy these first)
1. package.json
2. server/index.ts
3. server/whatsapp.ts
4. client/src/App.tsx
5. shared/schema.ts

### Component Files
1. client/src/components/whatsapp-status.tsx
2. client/src/components/contacts-list.tsx
3. client/src/components/message-templates.tsx
4. client/src/components/send-dialog.tsx

### Configuration Files
1. tsconfig.json
2. vite.config.ts
3. tailwind.config.ts
4. postcss.config.js
5. theme.json