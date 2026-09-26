import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from "node:child_process";
import { WebClient } from "@slack/web-api"; 
import si from 'systeminformation'; 
import fs from 'node:fs';            
import path from 'node:path'; 

// 1. Initialize Clients using Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
});

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

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
    getSystemHealth: async () => {
        const mem = await si.mem();
        const disk = await si.fsSize();
        const ramUsed = ((mem.active / mem.total) * 100).toFixed(1);
        const diskUsed = disk[0].use.toFixed(1);
        return `System Status: RAM at ${ramUsed}%, Disk at ${diskUsed}%.`;
    },
    organizeFolder: (dirPath) => {
        if (!fs.existsSync(dirPath)) return "Folder not found.";
        const files = fs.readdirSync(dirPath);
        const mapping = {
            'Documents': ['.pdf', '.txt', '.docx'],
            'Images': ['.jpg', '.png', '.gif'],
            'Code': ['.js', '.html', '.css', '.py']
        };
        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            for (const [folder, exts] of Object.entries(mapping)) {
                if (exts.includes(ext)) {
                    const targetDir = path.join(dirPath, folder);
                    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
                    fs.renameSync(path.join(dirPath, file), path.join(targetDir, file));
                }
            }
        });
        return "Folder organized successfully!";
    },
    manageTodo: (action, task) => {
        const filePath = './todo.json';
        let todos = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
        if (action === 'add') todos.push({ id: Date.now(), task, status: 'pending' });
        else if (action === 'clear') todos = [];
        fs.writeFileSync(filePath, JSON.stringify(todos, null, 2));
        return todos.length ? todos.map(t => `- ${t.task}`).join('\n') : "Your list is empty!";
    },
    getGitStatus: () => {
        try { return execSync("git status --short").toString() || "Git directory is clean."; }
        catch (e) { return "Not a git repository."; }
    }
};

// 3. Main Agent Loop
export async function run(query = '') {
    const history = [{ role: 'user', parts: [{ text: query }] }];
    try {
        const lowerQuery = query.toLowerCase();

        // TO-DO LIST LOGIC
        if (lowerQuery.includes("todo") || lowerQuery.includes("to-do")) {
            let resultText = "";
            if (lowerQuery.includes("add")) {
                const task = query.split("add ")[1] || "New Task";
                resultText = `Task Added. Current List:\n${tools.manageTodo('add', task)}`;
            } else if (lowerQuery.includes("clear")) {
                resultText = `List Cleared: ${tools.manageTodo('clear')}`;
            } else {
                resultText = `Your To-Do List:\n${tools.manageTodo('list')}`;
            }
            return [...history, { role: 'model', parts: [{ text: resultText }] }];
        }

        // GIT STATUS LOGIC
        if (lowerQuery.includes("git status")) {
            const status = tools.getGitStatus();
            return [...history, { role: 'model', parts: [{ text: `💻 Git Status:\n${status}` }] }];
        }

        // SYSTEM HEALTH
        if (lowerQuery.includes("system health") || lowerQuery.includes("monitor")) {
            const healthReport = await tools.getSystemHealth();
            return [...history, { role: 'model', parts: [{ text: `📊 ${healthReport}` }] }];
        }

        // FOLDER ORGANIZATION
        if (lowerQuery.includes("organize")) {
            const pathMatch = query.match(/(?:folder|path)\s+([^\s]+)/i);
            const targetPath = pathMatch ? pathMatch[1] : "./downloads"; 
            const result = tools.organizeFolder(targetPath);
            return [...history, { role: 'model', parts: [{ text: `📂 ${result}` }] }];
        }

        // SLACK AUTOMATION
        if (lowerQuery.includes("slack")) {
            const channelMatch = query.match(/C[A-Z0-9]{8,10}/);
            const channel = channelMatch ? channelMatch[0] : "C0AL5BT1HPS"; 
            const msg = query.split("saying ")[1] || "Hello from your AI Agent!";
            const resultText = await tools.sendSlackMessage(channel, msg);
            return [...history, { role: 'model', parts: [{ text: `✅ ${resultText}` }] }];
        }

        // FILE AUTOMATION
        if (lowerQuery.includes("create") && lowerQuery.includes("file")) {
            const fileNameMatch = query.match(/named\s+([^\s]+)/i) || query.match(/name\s+([^\s]+)/i);
            const fileName = fileNameMatch ? fileNameMatch[1] : "new_file.txt";
            let content = query.includes("with ") ? query.split("with ")[1] : "Created by Gemini Agent";
            const command = `echo ${content} > ${fileName}`;
            const resultText = tools.executeCommand(command);
            return [...history, { role: 'model', parts: [{ text: `Executed [${command}]. Result: ${resultText}` }] }];
        }

        const result = await model.generateContent({
            contents: history,
            generationConfig: { temperature: 0.7 }
        });
        return [...history, { role: 'model', parts: [{ text: result.response.text() }] }];

    } catch (error) {
        return [...history, { role: 'model', parts: [{ text: `Error: ${error.message}` }] }];
    }
}