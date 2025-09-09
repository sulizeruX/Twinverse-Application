// WhatsApp Test Script
const fetch = require('node-fetch');

// The phone number to test (replace with your number if different)
const phoneNumber = '+96893885660';
const message = '🔍 TEST MESSAGE: This is a test message from WhatsApp notification system';

// Check server status first
async function checkStatus() {
  try {
    console.log('Checking WhatsApp server status...');
    const response = await fetch('http://localhost:3001/status');
    const data = await response.json();
    console.log('Server status:', data);
    
    if (data.status === 'connected') {
      console.log('✅ Server is connected! Proceeding to send test message...');
      return true;
    } else {
      console.log('❌ Server is not connected. Please ensure the QR code has been scanned.');
      console.log('Error details:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to connect to the server:', error.message);
    console.log('Make sure the server is running on port 3001');
    return false;
  }
}

// Send a test message
async function sendTestMessage() {
  try {
    console.log(`Sending test message to ${phoneNumber}...`);
    
    const response = await fetch('http://localhost:3001/send-whatsapp-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        message,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test message sent successfully!');
      console.log('Details:', data);
    } else {
      console.log('❌ Failed to send test message');
      console.log('Error details:', data);
    }
  } catch (error) {
    console.log('❌ Error sending test message:', error.message);
  }
}

// Run the test
async function runTest() {
  const isConnected = await checkStatus();
  if (isConnected) {
    await sendTestMessage();
  }
  
  console.log('\nTest complete. If you did not receive the message, check:');
  console.log('1. Is the phone number format correct? It should include country code (e.g., +1234567890)');
  console.log('2. Is WhatsApp Web properly authenticated? Try restarting the server and scanning the QR code again');
  console.log('3. Check the server console for any specific error messages');
}

runTest();
