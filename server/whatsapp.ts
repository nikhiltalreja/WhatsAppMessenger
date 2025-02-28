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
      console.log('Closing existing browser instance...');
      await browser.close();
      browser = null;
      page = null;
    }

    console.log('Searching for Chrome installation...');
    const chromePath = await findChromePath();
    if (!chromePath) {
      throw new Error('Could not find Chrome/Chromium installation. Please install Chrome or Chromium.');
    }
    console.log('Found Chrome at:', chromePath);

    console.log('Launching browser with custom settings...');
    browser = await launch({
      headless: false,
      executablePath: chromePath,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1280,900',
        '--start-maximized',
        '--disable-gpu',
        '--disable-notifications',
      ]
    });

    broadcastStatus('connecting');
    console.log('Browser launched successfully');

    console.log('Creating new page...');
    page = await browser.newPage();

    // Set up error handling
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('error', err => console.error('Browser error:', err));
    page.on('pageerror', err => console.error('Page error:', err));

    console.log('Navigating to WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    console.log('WhatsApp Web page loaded');

    // First wait for either QR code or chat list
    console.log('Waiting for initial WhatsApp elements...');
    await page.waitForSelector('[data-testid="qrcode"], [data-testid="chat-list"]', {
      timeout: 30000
    });
    console.log('Initial elements detected');

    // Check which element is present
    const element = await page.evaluate(() => {
      const qr = document.querySelector('[data-testid="qrcode"]');
      const chat = document.querySelector('[data-testid="chat-list"]');
      return { hasQR: !!qr, hasChat: !!chat };
    });

    if (element.hasQR) {
      console.log('QR code detected, waiting for scan...');
      // Wait for chat list to appear after QR scan
      await page.waitForSelector('[data-testid="chat-list"]', {
        timeout: 120000, // 2 minutes timeout for QR scan
        visible: true
      }).catch(error => {
        console.log('QR code scan timeout:', error.message);
        throw new Error('QR code scan timeout - please try again');
      });
      console.log('QR code scanned successfully');
    } else if (element.hasChat) {
      console.log('Already logged in, chat list detected');
    }

    isConnected = true;
    broadcastStatus('connected');
    console.log('WhatsApp Web connected successfully!');
    return true;

  } catch (error) {
    console.error('Error connecting to WhatsApp:', error);
    isConnected = false;

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('TimeoutError')) {
        console.log('Connection timed out. Please try scanning the QR code again.');
      } else if (error.message.includes('net::ERR_')) {
        console.log('Network error. Please check your internet connection.');
      }
    }

    // Close browser on critical errors, but not on QR timeout
    if (browser && !(error instanceof Error && error.message.includes('QR code scan timeout'))) {
      await browser.close();
      browser = null;
      page = null;
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
    await page.goto(`https://web.whatsapp.com/send?phone=${formattedPhone}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the message input to be ready
    console.log('Waiting for chat to load...');
    const messageInputSelector = 'div[data-testid="conversation-compose-box-input"]';
    await page.waitForSelector(messageInputSelector, { 
      timeout: 30000,
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