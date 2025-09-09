/**
 * Test script to generate a new notification to test auto WhatsApp notifications
 */

const fetch = require('node-fetch');

// Generate a test notification
async function generateTestNotification() {
  console.log('Generating test notification to trigger WhatsApp auto-notification...');
  
  // First check if the WhatsApp server is running
  try {
    console.log('Checking WhatsApp server status...');
    const response = await fetch('http://localhost:3001/status');
    const data = await response.json();
    
    if (data.status !== 'connected') {
      console.log('⚠️ WhatsApp server is not connected!');
      console.log('Status:', data.status);
      console.log('Make sure you have scanned the QR code with your WhatsApp app.');
      return;
    }
    
    console.log('✅ WhatsApp server is connected and ready.');
  } catch (error) {
    console.log('❌ Could not connect to WhatsApp server:', error.message);
    console.log('Make sure the WhatsApp server is running on port 3001.');
    return;
  }
  
  // Choose a random notification type
  const notificationTypes = ['critical', 'warning', 'non-critical'];
  const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  
  // Generate notification content based on type
  let title, message, source, splineId;
  
  switch (type) {
    case 'critical':
      title = 'Critical Test Alert';
      message = 'This is a critical test notification generated to test auto WhatsApp notifications';
      source = 'Test System';
      splineId = 'TestSpline1';
      break;
    case 'warning':
      title = 'Warning Test Alert';
      message = 'This is a warning test notification generated to test auto WhatsApp notifications';
      source = 'Test Monitor';
      splineId = 'TestSpline2';
      break;
    case 'non-critical':
      title = 'Info Test Alert';
      message = 'This is an informational test notification generated to test auto WhatsApp notifications';
      source = 'Test Service';
      splineId = null;
      break;
  }
  
  // Now we'll use our test API to generate a notification
  try {
    console.log(`Generating a ${type} notification...`);
    // This is a test/simulated endpoint
    await fetch('http://localhost:3000/api/test/generate-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        title,
        message,
        source,
        splineId
      }),
    });
    
    console.log('✅ Test notification generated!');
    console.log('Check your WhatsApp to see if the auto-notification was triggered.');
    
  } catch (error) {
    console.log('❌ Failed to generate test notification:', error.message);
    console.log('This might be because the test API is not available.');
    console.log('Try adding a notification directly from the React app instead.');
  }
}

// Run the test
generateTestNotification();
