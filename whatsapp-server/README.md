# WhatsApp Notification Server

This server connects to WhatsApp Web and provides an API endpoint to send WhatsApp messages from your React dashboard.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm
- WhatsApp account on your phone

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### Authentication Process

The first time you run the server, you'll need to authenticate with WhatsApp:

1. Start the server and watch the console
2. A QR code will appear in the terminal
3. Open WhatsApp on your phone
4. Go to Settings > WhatsApp Web/Desktop
5. Scan the QR code displayed in the terminal
6. Wait for the "WhatsApp client is ready!" message

After the first authentication, the session will be saved locally (in the `whatsapp-session` folder), so you won't need to scan the QR code again unless you log out.

## API Endpoints

### Check Status
```
GET /status
```
Returns the connection status of the WhatsApp client.

### Send WhatsApp Notification
```
POST /send-whatsapp-notification
```

Request body:
```json
{
  "phone_number": "+1234567890",
  "message": "Hello from the dashboard!"
}
```

Response (success):
```json
{
  "success": true,
  "message": "WhatsApp notification sent successfully",
  "phone": "+1234567890"
}
```

## Headless Mode

The server is configured to run in headless mode, suitable for servers without a GUI. If you're running it locally and encounter issues, you may need to modify the puppeteer options in `server.js`.

## Troubleshooting

- If the connection drops, the server will attempt to reconnect automatically
- Check the `/status` endpoint to verify the connection state
- If authentication fails, delete the `whatsapp-session` folder and restart the server to get a new QR code
