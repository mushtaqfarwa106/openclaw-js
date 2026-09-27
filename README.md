# 🤖 OpenClaw Mini (Backend Automation Agent)

A multi-channel AI automation and background monitoring agent built with Node.js and Express. Designed to execute scheduled tasks, track real-time system health metrics, and stream formatted AI insights directly into messaging workflows like Slack using the Google Gemini API.

## 🚀 Key Features
* **Automated Background Cron Jobs:** Utilizes `node-cron` to execute scheduled health checks and developer activity digests.
* **System-Level OS Monitoring:** Integrates the `systeminformation` library to capture real-time platform data, CPU usage, and RAM consumption.
* **AI-Powered Code Digests:** Connects with the Google Gemini API to process and summarize repository activity.
* **Slack Webhook Integration:** Automatically streams live system metrics and formatted status reports into designated Slack channels.
* **Production Cloud Deployment:** Hosted live on Railway with a continuous external heartbeat (`cron-job.org`) to maintain 24/7 uptime.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Automation & Monitoring:** `node-cron`, `systeminformation`
* **APIs & SDKs:** Google Gemini API, `@slack/web-api`
* **Infrastructure:** Railway, `cron-job.org`

## 📊 Live System Output (Slack Integration)
*Automated system metrics and developer digests actively streaming into Slack:*

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/14e10a70-10b8-416b-a003-00f377f4e60b" />


## 🌐 Live Endpoint & Links
* **Repository:** [GitHub Repository](https://github.com/mushtaqfarwa106/openclaw-js.git)
* **Live Service URL:** [openclaw-js-production.up.railway.app](https://openclaw-js-production.up.railway.app)
