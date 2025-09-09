const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Create WhatsApp client with persistent session
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session' // Session data will be stored in this directory
    }),
    puppeteer: {
        // For headless server environments with better Docker compatibility
        executablePath: '/usr/bin/chromium-browser',
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas', 
            '--no-first-run', 
            '--no-zygote',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--disable-web-security',
            '--no-default-browser-check',
            '--no-pings',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list',
            '--user-data-dir=/tmp/chrome-user-data'
        ],
        headless: true // Set to true for servers without GUI
    }
});

// Store client state
let clientReady = false;
let connectionError = null;

// Handle QR code generation
client.on('qr', (qr) => {
    console.log('QR CODE RECEIVED:');
    console.log('------------------------');
    // Generate QR code in terminal for scanning
    qrcode.generate(qr, {small: true});
    console.log('------------------------');
    console.log('Scan this QR code with your WhatsApp app to authenticate');
});

// Handle successful authentication
client.on('ready', () => {
    clientReady = true;
    connectionError = null;
    console.log('WhatsApp client is ready! You can now send messages.');
});

// Handle disconnects
client.on('disconnected', (reason) => {
    clientReady = false;
    connectionError = reason;
    console.log('WhatsApp client disconnected:', reason);
    console.log('Attempting to reconnect...');
    client.initialize();
});

// Handle authentication failures
client.on('auth_failure', (message) => {
    clientReady = false;
    connectionError = message;
    console.error('Authentication failure:', message);
});

// Initialize client
client.initialize().catch(err => {
    connectionError = err.message;
    console.error('Failed to initialize WhatsApp client:', err);
});

// Health check endpoint for Docker
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'WhatsAppServer',
        whatsapp_status: clientReady ? 'connected' : 'disconnected'
    });
});

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: clientReady ? 'connected' : 'disconnected',
        error: connectionError
    });
});

// WhatsApp notification endpoint
app.post('/send-whatsapp-notification', async (req, res) => {
    const { phone_number, message } = req.body;

    // Validate request
    if (!phone_number || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'Phone number and message are required' 
        });
    }

    // Check if client is ready
    if (!clientReady) {
        return res.status(503).json({ 
            success: false, 
            error: 'WhatsApp client is not connected. Please ensure the QR code has been scanned.',
            connectionError
        });
    }

    try {
        // Format phone number correctly (remove any non-numeric chars except + sign)
        let formattedNumber = phone_number.replace(/[^0-9+]/g, '');
        
        // If number doesn't have the +, add it
        if (!formattedNumber.startsWith('+')) {
            formattedNumber = '+' + formattedNumber;
        }
        
        // Add @c.us suffix required by WhatsApp Web API
        const chatId = formattedNumber.replace('+', '') + '@c.us';

        // Send message
        await client.sendMessage(chatId, message);
        
        // Return success response
        res.status(200).json({ 
            success: true, 
            message: 'WhatsApp notification sent successfully',
            phone: formattedNumber 
        });
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send WhatsApp message',
            details: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`WhatsApp notification server running on port ${PORT}`);
    console.log(`- Status endpoint: http://localhost:${PORT}/status`);
    console.log(`- Send notification endpoint: http://localhost:${PORT}/send-whatsapp-notification`);
    console.log('Initializing WhatsApp Web client...');
    console.log('Check console for QR code to scan with your WhatsApp app');
});
