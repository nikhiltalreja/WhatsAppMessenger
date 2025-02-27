import puppeteer from "puppeteer";

export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: false, // Need to show browser for QR code scanning
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Go to WhatsApp Web
    await page.goto('https://web.whatsapp.com');

    // Wait for QR code scan and WhatsApp to load
    // This selector is for the main chat list which appears after successful login
    await page.waitForSelector('div[data-testid="chat-list"]', { 
      timeout: 60000 
    });

    // Format phone number (remove any spaces, dashes, etc)
    const formattedPhone = phoneNumber.replace(/\D/g, '');

    // Use WhatsApp's direct chat link
    await page.goto(`https://web.whatsapp.com/send?phone=${formattedPhone}`);

    // Wait for the message input to be ready
    const messageInputSelector = 'div[data-testid="conversation-compose-box-input"]';
    await page.waitForSelector(messageInputSelector, { 
      timeout: 20000,
      visible: true 
    });

    // Type the message
    await page.type(messageInputSelector, message);

    // Click the send button
    const sendButtonSelector = 'button[data-testid="compose-btn-send"]';
    await page.waitForSelector(sendButtonSelector);
    await page.click(sendButtonSelector);

    // Wait for message to be sent (check for double checkmark)
    await page.waitForSelector('span[data-testid="msg-dblcheck"]', {
      timeout: 10000
    });

    // Close browser
    await browser.close();
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}