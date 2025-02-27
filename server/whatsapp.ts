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

export async function connectToWhatsApp(): Promise<boolean> {
  try {
    // If there's an existing browser instance, close it first
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }

    console.log('Launching browser...');
    browser = await launch({
      headless: false, // Need to show browser for QR code scanning
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--disable-extensions',
        '--disable-features=site-per-process',
        '--disable-software-rasterizer'
      ]
    });

    broadcastStatus('connecting');
    console.log('Browser launched successfully');

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com');

    // Wait for QR code scan and WhatsApp to load
    console.log('Waiting for QR code scan...');
    await page.waitForSelector('div[data-testid="chat-list"]', { 
      timeout: 60000 // Give user 1 minute to scan QR code
    });

    isConnected = true;
    broadcastStatus('connected');
    console.log('WhatsApp Web connected successfully!');
    return true;

  } catch (error) {
    console.error('Error connecting to WhatsApp:', error);
    isConnected = false;
    if (browser) {
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