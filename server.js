// Import required modules
const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('ERROR: Telegram Bot Token or Chat ID not set.');
    process.exit(1);
}

// Send message to Telegram
async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        });
        console.log('Telegram message sent successfully!');
    } catch (error) {
        console.error('Failed to send Telegram message:', error?.response?.data || error.message);
        throw new Error('Telegram send failed.');
    }
}

// Form submission endpoint
app.post('/notify', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const message = `🚀 New subscriber for the launch!\n\n📧 Email: ${email}`;
    try {
        await sendTelegramMessage(message);
        res.status(200).json({ message: 'Notification sent successfully!' });
    } catch {
        res.status(500).json({ message: 'Failed to send notification.' });
    }
});

// Track website traffic
app.get('/track-traffic', async (req, res) => {
    const message = `🚨 New traffic detected on the website!\n🌐 IP: ${req.ip}`;
    try {
        await sendTelegramMessage(message);
        res.status(200).json({ message: 'Traffic notification sent!' });
    } catch {
        res.status(500).json({ message: 'Failed to send traffic notification.' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
