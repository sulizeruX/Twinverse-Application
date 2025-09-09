import React from 'react';
import { Card, Grid } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import WhatsAppNotification from 'components/WhatsAppNotification';

// The default phone number for all notifications
const DEFAULT_PHONE_NUMBER = '+96893885660';

function WhatsAppNotificationsSection() {
  // Event handlers
  const handleSuccess = (result) => {
    console.log('WhatsApp notification sent successfully:', result);
  };

  const handleError = (error) => {
    console.error('Failed to send WhatsApp notification:', error);
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={3}>
          Send WhatsApp Notifications
        </MDTypography>
        
        <Grid container spacing={2}>
          {/* Immediate Alerts */}
          <Grid item xs={12} md={4}>
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                System Alerts
              </MDTypography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Critical System Alert"
                    color="error"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="🚨 CRITICAL ALERT: System failure detected. Immediate action required!"
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Maintenance Required"
                    color="warning"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="⚠️ WARNING: Maintenance required on production line. Schedule service within 24 hours."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="System Recovery"
                    color="success"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="✅ NOTIFICATION: System has recovered and is now operating normally."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
          
          {/* Status Reports */}
          <Grid item xs={12} md={4}>
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                Status Reports
              </MDTypography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Daily Production Summary"
                    color="info"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="📊 DAILY SUMMARY: Production at 98% efficiency. All targets met. No critical issues reported."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Inventory Status"
                    color="info"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="📦 INVENTORY UPDATE: Raw materials at 42%. Reorder required for components A, B, and C."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Quality Check Report"
                    color="info"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="🔍 QUALITY REPORT: 99.7% pass rate. Three units flagged for manual review."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
          
          {/* Scheduled Notifications */}
          <Grid item xs={12} md={4}>
            <MDBox mb={3}>
              <MDTypography variant="h6" fontWeight="medium" mb={1}>
                Operational Notifications
              </MDTypography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Shift Change Notification"
                    color="dark"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="👥 SHIFT CHANGE: Team B now on duty. Key handover completed. No outstanding issues."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Downtime Scheduled"
                    color="dark"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="🔧 SCHEDULED DOWNTIME: System maintenance will begin in 1 hour. Expected duration: 2 hours."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <WhatsAppNotification 
                    buttonText="Software Update"
                    color="dark"
                    variant="contained"
                    fullWidth
                    defaultPhoneNumber={DEFAULT_PHONE_NUMBER}
                    defaultMessage="🔄 SOFTWARE UPDATE: System will be updated to version 3.5.2 tonight at 23:00. Brief service interruption expected."
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
}

export default WhatsAppNotificationsSection;
