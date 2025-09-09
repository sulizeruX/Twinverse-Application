/**
 * Test API endpoint to generate notifications for testing
 * This allows us to test the auto-notification feature
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint to generate a notification
app.post('/api/test/generate-notification', (req, res) => {
  try {
    const { type, title, message, source, splineId } = req.body;
    
    // Validation
    if (!type || !title || !message || !source) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    console.log(`Notification generated: ${type} - ${title}`);
    
    // In a real implementation, this would interact with your notification system
    // For now, we just simulate success
    
    res.status(200).json({ 
      success: true,
      message: 'Test notification generated successfully',
      notification: {
        type,
        title,
        message,
        source,
        splineId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating test notification:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate test notification' 
    });
  }
});

// Test endpoint to trigger auto-WhatsApp notification
app.get('/api/test/trigger-auto-notification', (req, res) => {
  try {
    // Create a simulated notification event that would trigger auto-notification
    console.log('Auto-notification test triggered');
    
    res.status(200).json({ 
      success: true,
      message: 'Auto-notification test triggered successfully',
    });
  } catch (error) {
    console.error('Error triggering auto-notification test:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to trigger auto-notification test' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Test API server running on port ${PORT}`);
  console.log(`- Generate notification endpoint: http://localhost:${PORT}/api/test/generate-notification`);
  console.log(`- Trigger auto-notification test: http://localhost:${PORT}/api/test/trigger-auto-notification`);
});
