🚀 OpenClaw Proactive Automation Engine

openclaw-js is a lightweight, self-contained background worker and automation engine built with Node.js, Express, node-cron, systeminformation, and the Slack Web API. It proactively tracks native system performance metrics and local Git repository activity, pushing structured operational digests directly into a designated Slack channel via scheduled cron jobs.

💡 Why This Architecture? (The Problem & Solution)

In many development environments, tracking infrastructure health and team velocity requires manual "pull" effort—opening terminal windows, checking task managers, or running git log.

openclaw-js implements a Proactive Push Architecture:

Zero Context Switching: Vital updates are brought directly to where the team already collaborates (Slack).

Asynchronous Visibility: Automates daily development standup summaries and system health checks without manual intervention.

Lightweight & Resilient: Avoids complex, fragile third-party AI dependencies or heavy authentication overhead by relying on robust, native Node.js ecosystems combined with a lightweight Express heartbeat server.

🛠️ Tech Stack

Runtime: Node.js (ES Modules)

Web Framework: Express (handles lightweight server binding and health checks)

Task Scheduling: node-cron (Production-ready cron timing schedules)

System Monitoring: systeminformation (Cross-platform OS, CPU, and RAM metrics)

Version Control Integration: Native execSync via Node child processes for Git audit logs

Notifications: @slack/web-api (Official Slack Bot integration)

⚙️ Features & Production Schedule

System Metrics Report (Runs every 6 hours: 0 */6 * * *)

Inspects host OS platform and release data.

Tracks real-time CPU utilization and active RAM consumption percentages.

Formats data into clean Markdown blocks for immediate Slack alerts.

Git Commit Activity Digest (Runs daily at 9:00 AM: 0 9 * * *)

Executes local Git log checks (git log -n 3 --oneline).

Provides an automated morning recap of recent code commits as an asynchronous standup summary.

🚀 Getting Started

Prerequisites

Node.js (v18+ recommended)

A Slack Workspace with a configured Bot Token (chat:write scope) and target Channel ID.

Installation

Clone the repository:

git clone https://github.com/your-username/openclaw-js.git
cd openclaw-js


Install dependencies:

npm install


Configure your environment variables:
Create a .env file in the root directory and add your credentials:

SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
PORT=8000


Run the engine:

node index.js