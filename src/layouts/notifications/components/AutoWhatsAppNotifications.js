import React, { useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Switch, 
  FormControlLabel, 
  TextField, 
  Box, 
  Chip, 
  Alert, 
  CircularProgress,
  Divider,
  Paper,
  Grid,
  ButtonGroup
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddAlertIcon from '@mui/icons-material/AddAlert';

// Custom hook for auto WhatsApp notifications
import useAutoWhatsAppNotifications from 'hooks/useAutoWhatsAppNotifications';

// Notification context
import { useNotification } from 'context/notification-context';

// Material Dashboard components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

/**
 * Component for automatic WhatsApp notifications of system alerts
 */
function AutoWhatsAppNotifications() {
  const {
    autoNotifyEnabled,
    setAutoNotifyEnabled,
    phoneNumber,
    setPhoneNumber,
    lastSentNotification,
    sendingStatus,
    resetProcessedNotifications
  } = useAutoWhatsAppNotifications();
  
  // Access notification context to generate test notifications
  const { addTestNotification } = useNotification();

  // Check WhatsApp server status on load
  useEffect(() => {
    const checkServer = async () => {
      try {
        await fetch('http://localhost:3001/status');
      } catch (error) {
        console.error('WhatsApp server connection error:', error);
      }
    };
    
    checkServer();
  }, []);

  // Generate test notification functions
  const generateTestNotification = (type) => {
    // Only proceed if auto-notify is enabled
    if (!autoNotifyEnabled) {
      // Show a dialog or warning that auto-notify needs to be enabled
      alert("Please enable Auto-Notifications first");
      return;
    }
    
    addTestNotification(type);
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" mb={2}>
          <WhatsAppIcon color="success" sx={{ fontSize: 28, mr: 1 }} />
          <MDTypography variant="h5" fontWeight="medium">
            Automatic WhatsApp Notifications
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          {/* Status & Controls */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <NotificationsActiveIcon color={autoNotifyEnabled ? "success" : "disabled"} sx={{ mr: 1 }} />
                  <MDTypography variant="h6">
                    Auto-Notification Status
                  </MDTypography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoNotifyEnabled}
                      onChange={(e) => setAutoNotifyEnabled(e.target.checked)}
                      color="success"
                    />
                  }
                  label={autoNotifyEnabled ? "Enabled" : "Disabled"}
                />
              </Box>

              <MDTypography variant="body2" color="text" mb={3}>
                When enabled, any new system notifications will be automatically sent to the specified WhatsApp number.
                {autoNotifyEnabled && " New notifications will be sent immediately when they appear."}
              </MDTypography>

              <Divider sx={{ my: 2 }} />
              
              <MDBox mb={2}>
                <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                  WhatsApp Recipient Number
                </MDTypography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number with country code"
                  helperText="Include country code (e.g., +968 for Oman)"
                  disabled={sendingStatus.sending}
                  size="small"
                />
              </MDBox>

              <Divider sx={{ my: 2 }} />
              
              <MDBox>
                <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
                  Generate Test Notification
                </MDTypography>
                <MDTypography variant="caption" color="text" mb={2} display="block">
                  Create a test notification to verify auto-WhatsApp functionality
                </MDTypography>
                
                <ButtonGroup variant="outlined" size="small" fullWidth>
                  <MDButton
                    color="error"
                    onClick={() => generateTestNotification('critical')}
                    startIcon={<AddAlertIcon />}
                    disabled={sendingStatus.sending}
                  >
                    Critical
                  </MDButton>
                  <MDButton
                    color="warning"
                    onClick={() => generateTestNotification('warning')}
                    startIcon={<AddAlertIcon />}
                    disabled={sendingStatus.sending}
                  >
                    Warning
                  </MDButton>
                  <MDButton
                    color="info"
                    onClick={() => generateTestNotification('non-critical')}
                    startIcon={<AddAlertIcon />}
                    disabled={sendingStatus.sending}
                  >
                    Info
                  </MDButton>
                </ButtonGroup>
              </MDBox>

              {sendingStatus.error && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 2 }}
                  icon={<ErrorIcon fontSize="inherit" />}
                >
                  Error sending notification: {sendingStatus.error}
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Last Notification */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box mb={2}>
                <MDTypography variant="h6">
                  Last Sent Notification
                </MDTypography>
              </Box>
              
              {sendingStatus.sending ? (
                <Box display="flex" alignItems="center" mb={2}>
                  <CircularProgress size={20} color="info" sx={{ mr: 2 }} />
                  <MDTypography variant="body2">
                    Sending WhatsApp notification...
                  </MDTypography>
                </Box>
              ) : lastSentNotification ? (
                <>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <MDTypography variant="body2" fontWeight="medium">
                      Successfully sent at {new Date(lastSentNotification.timestamp).toLocaleTimeString()}
                    </MDTypography>
                  </Box>
                  
                  <MDBox p={2} bgcolor="grey.100" borderRadius={1}>
                    <MDTypography variant="body2">
                      <strong>Title:</strong> {lastSentNotification.title}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Notification ID: {lastSentNotification.id}
                    </MDTypography>
                  </MDBox>
                </>
              ) : (
                <MDTypography variant="body2" color="text">
                  No notifications have been automatically sent yet. Any new notifications will be sent to WhatsApp when they appear.
                </MDTypography>
              )}

              <Divider sx={{ my: 2 }} />

              <MDBox>
                <MDTypography variant="caption" display="block" mb={1}>
                  Notification Types That Will Be Sent:
                </MDTypography>
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  <Chip 
                    icon={<WhatsAppIcon />}
                    label="Critical" 
                    color="error" 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<WhatsAppIcon />}
                    label="Warning" 
                    color="warning" 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<WhatsAppIcon />}
                    label="Non-Critical" 
                    color="info" 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
                
                <MDButton 
                  variant="text" 
                  color="dark" 
                  size="small"
                  onClick={resetProcessedNotifications}
                >
                  Reset Notification History
                </MDButton>
              </MDBox>
            </Paper>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default AutoWhatsAppNotifications;
