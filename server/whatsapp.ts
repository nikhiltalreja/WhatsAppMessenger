import puppeteer from "puppeteer";

export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Launch the browser with minimal dependencies
    const browser = await puppeteer.launch({
      headless: false, // Need to show browser for QR code scanning
      executablePath: '/nix/store/chrome/bin/chromium',
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

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com');

    // Wait for QR code scan and WhatsApp to load
    console.log('Waiting for QR code scan...');
    await page.waitForSelector('div[data-testid="chat-list"]', { 
      timeout: 60000 // Give user 1 minute to scan QR code
    });

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
    await browser.close();
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}