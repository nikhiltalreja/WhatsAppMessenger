import puppeteer from "puppeteer";

export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: false, // We need to show the browser for WhatsApp Web QR code scanning
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    // Go to WhatsApp Web
    await page.goto('https://web.whatsapp.com');
    
    // Wait for user to scan QR code and load WhatsApp
    await page.waitForSelector('._2vDPL', { timeout: 60000 }); // WhatsApp main page selector
    
    // Navigate to chat via URL
    await page.goto(`https://web.whatsapp.com/send?phone=${phoneNumber}`);
    
    // Wait for chat to load
    await page.waitForSelector('._3Uu1_', { timeout: 20000 }); // Message input selector
    
    // Type message
    await page.type('._3Uu1_', message);
    
    // Send message
    await page.keyboard.press('Enter');
    
    // Wait for message to send
    await page.waitForTimeout(2000);
    
    await browser.close();
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}
