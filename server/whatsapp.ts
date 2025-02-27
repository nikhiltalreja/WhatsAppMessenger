import { Browser, Page, launch } from "puppeteer-core";
import { broadcastStatus } from "./websocket";

let isConnected = false;
let browser: Browser | null = null;
let page: Page | null = null;

export function getWhatsAppStatus(): 'disconnected' | 'connecting' | 'connected' {
  if (!browser) return 'disconnected';
  if (!isConnected) return 'connecting';
  return 'connected';
}

async function findChromePath(): Promise<string | undefined> {
  const paths = [
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  for (const path of paths) {
    try {
      const fs = await import('fs');
      if (fs.existsSync(path)) {
        return path;
      }
    } catch {}
  }
  return undefined;
}

export async function connectToWhatsApp(): Promise<boolean> {
  try {
    // If there's an existing browser instance, close it first
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }

    console.log('Launching browser...');
    const chromePath = await findChromePath();
    if (!chromePath) {
      throw new Error('Could not find Chrome/Chromium installation. Please install Chrome or Chromium.');
    }

    browser = await launch({
      headless: false,
      executablePath: chromePath,
      defaultViewport: {
        width: 1280,
        height: 800
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1280,800',
        '--start-maximized',
        '--disable-extensions',
      ]
    });

    broadcastStatus('connecting');
    console.log('Browser launched successfully');

    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Enable better error logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('error', err => console.error('Browser error:', err));
    page.on('pageerror', err => console.error('Page error:', err));

    console.log('Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com');

    // Wait for QR code scan and WhatsApp to load with increased timeout
    console.log('Waiting for QR code scan...');
    await page.waitForSelector('div[data-testid="chat-list"]', { 
      timeout: 120000, // Increase timeout to 2 minutes
      visible: true 
    });

    isConnected = true;
    broadcastStatus('connected');
    console.log('WhatsApp Web connected successfully!');
    return true;

  } catch (error) {
    console.error('Error connecting to WhatsApp:', error);
    isConnected = false;
    // Don't close the browser on timeout, let user retry
    if (!(error instanceof Error && error.message.includes('TimeoutError'))) {
      if (browser) {
        await browser.close();
        browser = null;
        page = null;
      }
    }
    broadcastStatus('disconnected');
    return false;
  }
}

export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    if (!browser || !page || !isConnected) {
      throw new Error('WhatsApp is not connected. Please connect first.');
    }

    // Format phone number (remove any spaces, dashes, etc)
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    console.log(`Navigating to chat with ${formattedPhone}...`);

    // Use WhatsApp's direct chat link
    await page.goto(`https://web.whatsapp.com/send?phone=${formattedPhone}`);

    // Wait for the message input to be ready
    console.log('Waiting for chat to load...');
    const messageInputSelector = 'div[data-testid="conversation-compose-box-input"]';
    await page.waitForSelector(messageInputSelector, { 
      timeout: 20000,
      visible: true 
    });

    // Type the message
    console.log('Typing message...');
    await page.type(messageInputSelector, message);

    // Click the send button
    console.log('Sending message...');
    const sendButtonSelector = 'button[data-testid="compose-btn-send"]';
    await page.waitForSelector(sendButtonSelector);
    await page.click(sendButtonSelector);

    // Wait for message to be sent (check for double checkmark)
    console.log('Waiting for message to be sent...');
    await page.waitForSelector('span[data-testid="msg-dblcheck"]', {
      timeout: 10000
    });

    console.log('Message sent successfully!');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

export async function disconnectWhatsApp(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
  isConnected = false;
  broadcastStatus('disconnected');
}