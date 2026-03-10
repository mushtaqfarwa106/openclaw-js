import express from 'express';
import { run } from './agent.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('AI Agent Server is Running!');
});

app.post('/message', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "No message provided" });
    }
    
    try {
        console.log(`Processing: ${message}`);
        const history = await run(message);
        
        // Always return 200 with the history body
        return res.status(200).json({ 
            success: true,
            messages: history 
        });

    } catch (error) {
        console.error("Server Route Error:", error.message);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});