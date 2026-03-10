import { WebClient } from "@slack/web-api";
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

// --- CONFIGURATION ---
const SLACK_TOKEN = "xoxb-10653699693957-10650791541875-ZmweK6pvhP6CPGtLwbVbkQj4";
// Using the ID from your screenshot (C0AL5BT1HPS) to prevent "channel_not_found"
const TEST_SLACK_CHANNEL = "C0AL5BT1HPS"; 
const TEST_WHATSAPP_NUMBER = "923358156786"; 

const slack = new WebClient(SLACK_TOKEN);

async function testSlack() {
    try {
        console.log("--- Testing Slack ---");
        const auth = await slack.auth.test();
        console.log(`✅ Slack Connected as: ${auth.user}`);
        
        await slack.chat.postMessage({
            channel: TEST_SLACK_CHANNEL,
            text: "Hello! If you see this, Slack is finally fixed! 🤖"
        });
        console.log(`✅ Message sent to Slack ID: ${TEST_SLACK_CHANNEL}`);
    } catch (error) {
        console.error("❌ Slack Error:", error.message);
    }
}

const whatsapp = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    puppeteer: { headless: true, args: ['--no-sandbox'] }
});

whatsapp.on('qr', qr => {
    console.log("--- WhatsApp QR Code ---");
    qrcode.generate(qr, { small: true });
});

whatsapp.on('ready', async () => {
    console.log("✅ WhatsApp is Ready!");
    const chatId = `${TEST_WHATSAPP_NUMBER}@c.us`;
    await whatsapp.sendMessage(chatId, "WhatsApp is working! 🎉");
    console.log(`✅ Test message sent to WhatsApp.`);
});

testSlack();
whatsapp.initialize();