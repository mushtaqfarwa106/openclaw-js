import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from "node:child_process";
import { WebClient } from "@slack/web-api"; 
import pkg from 'whatsapp-web.js'; 
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal'; 

// 1. Initialize Clients
const genAI = new GoogleGenerativeAI("AIzaSyDy9B5vS4n0AXuKnFR3Emdl4nVQBC1ZhXw");

// USE THE NEW GEMINI 3.1 MODEL NAME
const model = genAI.getGenerativeModel({ 
    model: "gemini-3.1-flash-lite-preview" 
});

const slack = new WebClient("xoxb-10653699693957-10650791541875-ZmweK6pvhP6CPGtLwbVbkQj4");
const whatsapp = new Client({ 
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox'] }
});

whatsapp.on('qr', qr => qrcode.generate(qr, { small: true }));
whatsapp.on('ready', () => console.log('WhatsApp is ready!'));
whatsapp.initialize();

// 2. Tools
const tools = {
    executeCommand: (cmd) => {
        try { 
            const result = execSync(cmd);
            return result.toString() || "Success (no output)"; 
        } catch (e) { return `Error: ${e.message}`; }
    },
    sendSlackMessage: async (channel, message) => {
        try {
            await slack.chat.postMessage({ channel: channel, text: message });
            return "Slack message sent!";
        } catch (e) { return `Slack Error: ${e.message}`; }
    },
    sendWhatsAppMessage: async (phone, message) => {
        try {
            const chatId = `${phone.replace(/\D/g, '')}@c.us`;
            await whatsapp.sendMessage(chatId, message);
            return "WhatsApp message sent!";
        } catch (e) { return `WhatsApp Error: ${e.message}`; }
    }
};

// 3. Main Agent Loop
export async function run(query = '') {
    const history = [
        { role: 'user', parts: [{ text: query }] }
    ];

    try {
        const lowerQuery = query.toLowerCase();

        // SLACK AUTOMATION
        if (lowerQuery.includes("slack")) {
            const channelMatch = query.match(/C[A-Z0-9]{8,10}/);
            const channel = channelMatch ? channelMatch[0] : "C0AL5BT1HPS"; 
            const msg = query.split("saying ")[1] || "Hello from your AI Agent!";
            
            const resultText = await tools.sendSlackMessage(channel, msg);
            return [...history, { role: 'model', parts: [{ text: `✅ ${resultText} to ${channel}` }] }];
        }

        // WHATSAPP AUTOMATION
        if (lowerQuery.includes("whatsapp")) {
            const phoneMatch = query.match(/\d{10,15}/);
            const phone = phoneMatch ? phoneMatch[0] : "923XXXXXXXXX"; 
            const msg = query.split("saying ")[1] || "Hello from WhatsApp!";
            
            const resultText = await tools.sendWhatsAppMessage(phone, msg);
            return [...history, { role: 'model', parts: [{ text: `✅ ${resultText} to ${phone}` }] }];
        }

        // FILE AUTOMATION
        if (lowerQuery.includes("create") && lowerQuery.includes("file")) {
            const fileNameMatch = query.match(/named\s+([^\s]+)/i) || query.match(/name\s+([^\s]+)/i);
            const fileName = fileNameMatch ? fileNameMatch[1] : "new_file.txt";
            
            let content = "Created by Gemini 3 Agent";
            if (query.includes("with ")) {
                content = query.split("with ")[1];
            }

            const command = `echo ${content} > ${fileName}`;
            const resultText = tools.executeCommand(command);

            return [
                ...history,
                { role: 'model', parts: [{ text: `Gemini 3 Action: Executed [${command}]. Result: ${resultText}` }] }
            ];
        }

        // Standard chat with Gemini 3 (Fixed property name to generationConfig)
        const result = await model.generateContent({
            contents: history,
            generationConfig: { 
                temperature: 0.7 
            }
        });
        
        const responseText = result.response.text();
        return [...history, { role: 'model', parts: [{ text: responseText }] }];

    } catch (error) {
        console.error("Gemini 3 Error:", error.message);
        return [
            ...history, 
            { role: 'model', parts: [{ text: `Gemini 3 Error: ${error.message}` }] }
        ];
    }
}