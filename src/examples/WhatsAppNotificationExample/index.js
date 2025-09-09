import React, { useState, useEffect } from 'react';
import { Grid, Card, Paper, Box } from "@mui/material";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// WhatsApp notification component
import WhatsAppNotification from "components/WhatsAppNotification";

// Local storage key
const PHONE_NUMBER_KEY = 'whatsapp_notification_phone';

/**
 * Example component demonstrating how to use WhatsAppNotification in the dashboard
 */
function WhatsAppNotificationExample() {
  // Get saved phone number from localStorage or use default
  const [phoneNumber, setPhoneNumber] = useState(() => {
    return localStorage.getItem(PHONE_NUMBER_KEY) || "+96893885660";
  });

  // Save phone number to localStorage when changed
  const handlePhoneNumberChange = (e) => {
    const newNumber = e.target.value;
    setPhoneNumber(newNumber);
    localStorage.setItem(PHONE_NUMBER_KEY, newNumber);
  };

  // Handle success notification
  const handleSuccess = (result) => {
    console.log("WhatsApp notification sent successfully:", result);
  };

  // Handle error
  const handleError = (error) => {
    console.error("Failed to send WhatsApp notification:", error);
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={2}>
          WhatsApp Notifications
        </MDTypography>
        
        {/* Phone Number Input */}
        <MDBox mb={3}>
          <MDTypography variant="subtitle2" fontWeight="medium" mb={1}>
            WhatsApp Recipient Number
          </MDTypography>
          <MDInput
            fullWidth
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="Enter phone number with country code"
            helperText="Include country code (e.g., +968 for Oman)"
            size="small"
          />
          <MDTypography variant="caption" color="text">
            This number will be used for all WhatsApp notifications across the dashboard
          </MDTypography>
        </MDBox>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <MDTypography variant="subtitle1" fontWeight="medium" mb={2}>
                Quick Notification
              </MDTypography>
              
              <MDTypography variant="body2" color="text" mb={2}>
                Send a WhatsApp notification to alert about important system events.
              </MDTypography>
              
              <WhatsAppNotification 
                buttonText="Send WhatsApp Alert"
                color="success"
                onSuccess={handleSuccess}
                onError={handleError}
                defaultPhoneNumber={phoneNumber}
                defaultMessage="⚠️ ALERT: Critical system notification from Dashboard"
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <MDTypography variant="subtitle1" fontWeight="medium" mb={2}>
                Critical Alert
              </MDTypography>
              
              <MDTypography variant="body2" color="text" mb={2}>
                Send a critical WhatsApp alert when immediate attention is required.
              </MDTypography>
              
              <WhatsAppNotification 
                buttonText="Send Critical Alert"
                color="error"
                variant="contained"
                onSuccess={handleSuccess}
                onError={handleError}
                defaultPhoneNumber={phoneNumber}
                defaultMessage="🚨 CRITICAL ALERT: Immediate action required!"
              />
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <MDTypography variant="subtitle1" fontWeight="medium" mb={2}>
                Custom Notification
              </MDTypography>
              
              <MDTypography variant="body2" color="text" mb={2}>
                Send a custom WhatsApp notification with specific information.
              </MDTypography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box mb={1}>
                    <MDTypography variant="caption" fontWeight="medium">
                      Spline Status Update
                    </MDTypography>
                  </Box>
                  <WhatsAppNotification 
                    buttonText="Spline Status"
                    color="info"
                    variant="outlined"
                    size="small"
                    fullWidth
                    defaultPhoneNumber={phoneNumber}
                    defaultMessage="📊 Spline Status Update: All systems operational"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box mb={1}>
                    <MDTypography variant="caption" fontWeight="medium">
                      Maintenance Alert
                    </MDTypography>
                  </Box>
                  <WhatsAppNotification 
                    buttonText="Maintenance"
                    color="warning"
                    variant="outlined"
                    size="small"
                    fullWidth
                    defaultPhoneNumber={phoneNumber}
                    defaultMessage="🔧 Scheduled maintenance starting in 30 minutes. System may be temporarily unavailable."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box mb={1}>
                    <MDTypography variant="caption" fontWeight="medium">
                      Stock Alert
                    </MDTypography>
                  </Box>
                  <WhatsAppNotification 
                    buttonText="Stock Alert"
                    color="error"
                    variant="outlined"
                    size="small"
                    fullWidth
                    defaultPhoneNumber={phoneNumber}
                    defaultMessage="⚠️ INVENTORY ALERT: Stock levels critical. Immediate restocking required."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box mb={1}>
                    <MDTypography variant="caption" fontWeight="medium">
                      Performance Report
                    </MDTypography>
                  </Box>
                  <WhatsAppNotification 
                    buttonText="Send Report"
                    color="dark"
                    variant="outlined"
                    size="small"
                    fullWidth
                    defaultPhoneNumber={phoneNumber}
                    defaultMessage="📈 Daily Performance Summary: Production rate at 95%, all targets met."
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default WhatsAppNotificationExample;
