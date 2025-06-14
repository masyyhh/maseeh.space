const express = require('express');
const path = require('path');
const axios = require('axios');
const UAParser = require('ua-parser-js');
require('dotenv').config();

const app = express();
app.set('trust proxy', 'loopback');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bot credentials from .env
const VISITOR_BOT_TOKEN = process.env.TELEGRAM_VISITOR_BOT_TOKEN;
const VISITOR_CHAT_ID = process.env.TELEGRAM_VISITOR_CHAT_ID;
const SUBSCRIBER_BOT_TOKEN = process.env.TELEGRAM_SUBSCRIBER_BOT_TOKEN;
const SUBSCRIBER_CHAT_ID = process.env.TELEGRAM_SUBSCRIBER_CHAT_ID;

if (!VISITOR_BOT_TOKEN || !VISITOR_CHAT_ID || !SUBSCRIBER_BOT_TOKEN || !SUBSCRIBER_CHAT_ID) {
    console.error('ERROR: One or more Telegram Bot Tokens or Chat IDs are missing in the .env file.');
    process.exit(1);
}

// Track visits
let visitCount = 0;

// Route to track homepage visits
app.get('/', async (req, res) => {
    try {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'] || 'Not available';
        const parser = new UAParser(userAgent);
        const uaResult = parser.getResult();

        visitCount++;

        const visitTime = new Date().toLocaleString('en-US', {
            timeZone: 'Indian/Maldives',
            hour12: true,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // --- ENHANCED INFORMATION GATHERING ---

        // 1. Get Geolocation from IP
        let geoData = {
            country: 'N/A',
            city: 'N/A',
            isp: 'N/A'
        };
        if (ip !== '::1' && ip !== '127.0.0.1') { // Don't lookup localhost
            try {
                const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`);
                if (geoResponse.data.status === 'success') {
                    geoData = {
                        country: geoResponse.data.country || 'N/A',
                        city: geoResponse.data.city || 'N/A',
                        isp: geoResponse.data.isp || 'N/A'
                    };
                }
            } catch (error) {
                console.error('Failed to fetch geolocation data:', error.message);
            }
        } else {
            geoData.city = 'Localhost';
        }


        // 2. Parse User-Agent
        const browser = `${uaResult.browser.name || 'N/A'} ${uaResult.browser.version || ''}`.trim();
        const os = `${uaResult.os.name || 'N/A'} ${uaResult.os.version || ''}`.trim();
        const device = uaResult.device.vendor ? `${uaResult.device.vendor} ${uaResult.device.model}` : (uaResult.device.type || 'Desktop');

        // 3. Simple Bot Detection
        const isBot = /bot|crawl|spider/i.test(userAgent);


        // --- CONSTRUCTING THE NEW MESSAGE ---

        let message = `
*Visitor Alert!* ${isBot ? '🤖 (Bot Detected)' : '🌐'}
-----------------------------------
*Location:* ${geoData.city}, ${geoData.country}
*IP Address:* \`${ip}\`
*ISP:* ${geoData.isp}
*Device:* ${device}
*OS:* ${os}
*Browser:* ${browser}
*Time:* ${visitTime}

*Total Visits:* ${visitCount}
        `;

        const telegramApiUrl = `https://api.telegram.org/bot${VISITOR_BOT_TOKEN}/sendMessage`;

        axios.post(telegramApiUrl, {
            chat_id: VISITOR_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        }).catch(error => {
            console.error('Failed to send Telegram visitor notification:', error.response ? error.response.data : error.message);
        });

    } catch (error) {
        console.error('Error preparing visitor notification:', error);
    }

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to notify about new subscriber
app.post('/notify', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    const message = `🚀 New subscriber for the launch!\n\nEmail: ${email}\n\n🌍`;
    const telegramApiUrl = `https://api.telegram.org/bot${SUBSCRIBER_BOT_TOKEN}/sendMessage`;

    try {
        await axios.post(telegramApiUrl, {
            chat_id: SUBSCRIBER_CHAT_ID,
            text: message
        });

        res.status(200).json({ message: 'Notification sent successfully!' });

    } catch (error) {
        console.error('Failed to send Telegram message:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to send notification.' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});