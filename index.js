import 'dotenv/config';
import { WebClient } from '@slack/web-api';
import cron from 'node-cron';
import si from 'systeminformation';
import { execSync } from 'node:child_process';
import express from 'express';

// Initialize Express for Render web service health checks
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).send('🚀 OpenClaw Proactive Automation Engine is Alive!');
});

app.listen(PORT, () => {
    console.log(`🌍 HTTP Server is running on port ${PORT}`);
});

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const CHANNEL_ID = "C0AL5BT1HPS"; // Your Slack channel ID

// 1. System Metrics Monitor Cron (Runs every 6 hours in production)
cron.schedule('0 */6 * * *', async () => {
    console.log("⏰ Running system metrics check...");
    try {
        const mem = await si.mem();
        const cpu = await si.currentLoad();
        const osInfo = await si.osInfo();
        
        const ramUsed = ((mem.active / mem.total) * 100).toFixed(1);
        const cpuLoad = cpu.currentLoad.toFixed(1);

        const message = `📊 *System Metrics Report*\n• *Platform:* ${osInfo.platform} (${osInfo.release})\n• *CPU Usage:* ${cpuLoad}\%\n• *RAM Usage:*${ramUsed}%`;
        
        await slack.chat.postMessage({
            channel: CHANNEL_ID,
            text: message
        });
        console.log("✅ System metrics sent to Slack!");
    } catch (error) {
        console.error("❌ System metrics check error:", error.message);
    }
});

// 2. Git Activity Digest Cron (Runs daily at 9:00 AM in production)
cron.schedule('0 9 * * *', async () => {
    console.log("⏰ Running Git commit digest check...");
    try {
        const gitLog = execSync('git log -n 3 --oneline').toString() || "No recent commits.";
        await slack.chat.postMessage({
            channel: CHANNEL_ID,
            text: `💻 *Dev Digest (Recent Git Activity):*\n\`\`\`${gitLog}\`\`\``
        });
        console.log("✅ Git digest sent to Slack!");
    } catch (e) {
        console.log("⚠️ Git digest skipped: Not a git repository or no commits found yet.");
    }
});

console.log("🚀 OpenClaw Proactive Automation Engine Running!");