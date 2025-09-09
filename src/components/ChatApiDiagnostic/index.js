import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Material Dashboard components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

/**
 * Component to diagnose API connection issues with the AI Chat backend
 */
const ChatApiDiagnostic = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello, this is a test message from the dashboard.');
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  
  // Check API status
  const checkApiStatus = async () => {
    setLoading(true);
    setApiStatus(null);
    setErrorDetails(null);
    
    try {
      const response = await fetch('http://localhost:9000/api/check-key');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setApiStatus({
        status: 'error',
        message: 'Failed to connect to API server',
        details: {
          exception: error.message
        }
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Test sending a message
  const testApiMessage = async () => {
    setTestLoading(true);
    setTestResponse(null);
    setErrorDetails(null);
    
    try {
      const response = await fetch('http://localhost:9000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          dashboardData: {
            test: 'This is test dashboard data',
            timestamp: new Date().toISOString()
          }
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setTestResponse({
          status: 'error',
          message: `API returned status ${response.status}`,
          responseText: errorText
        });
        return;
      }
      
      const data = await response.json();
      setTestResponse({
        status: 'success',
        reply: data.reply
      });
    } catch (error) {
      setTestResponse({
        status: 'error',
        message: 'Failed to send message to API',
        error: error.message
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);
  
  // Copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5" fontWeight="medium" mb={1}>
          AI Chat API Diagnostic
        </MDTypography>
        <MDTypography variant="body2" color="text" mb={3}>
          Use this tool to diagnose connection issues with the AI Chat API.
        </MDTypography>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* API Status */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6">
              API Connection Status
            </MDTypography>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={checkApiStatus}
              disabled={loading}
              size="small"
              variant="outlined"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </Button>
          </Box>
          
          {loading ? (
            <Box display="flex" alignItems="center" gap={2}>
              <CircularProgress size={20} />
              <Typography>Checking API status...</Typography>
            </Box>
          ) : apiStatus ? (
            <Box>
              {apiStatus.status === 'success' ? (
                <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}>
                  <AlertTitle>API Connection Successful</AlertTitle>
                  {apiStatus.message}
                </Alert>
              ) : (
                <Alert severity="error" icon={<ErrorIcon fontSize="inherit" />}>
                  <AlertTitle>API Connection Failed</AlertTitle>
                  {apiStatus.message}
                  
                  {apiStatus.details && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Error Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                          {JSON.stringify(apiStatus.details, null, 2)}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Alert>
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">Click "Check Status" to verify API connection.</Typography>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Test Message */}
        <Box mb={4}>
          <MDTypography variant="h6" mb={2}>
            Test API Message
          </MDTypography>
          
          <Box mb={2}>
            <TextField
              fullWidth
              label="Test Message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              multiline
              rows={2}
              variant="outlined"
              size="small"
            />
          </Box>
          
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <MDButton 
              color="info" 
              onClick={testApiMessage}
              disabled={testLoading || !testMessage.trim()}
              startIcon={testLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              Send Test Message
            </MDButton>
          </Box>
          
          {testResponse && (
            <Box mt={2}>
              {testResponse.status === 'success' ? (
                <Alert severity="success">
                  <AlertTitle>Response Received</AlertTitle>
                  <Typography variant="body2">{testResponse.reply}</Typography>
                </Alert>
              ) : (
                <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  <Typography variant="body2">{testResponse.message}</Typography>
                  
                  {testResponse.responseText && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Response Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="caption">Response Text:</Typography>
                          <Tooltip title="Copy to clipboard">
                            <IconButton size="small" onClick={() => copyToClipboard(testResponse.responseText)}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                          {testResponse.responseText}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Backend Server Information */}
        <Box>
          <MDTypography variant="h6" mb={2}>
            Backend Server Information
          </MDTypography>
          
          <Typography variant="body2" paragraph>
            <strong>API URL:</strong> http://localhost:9000
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Log File Location:</strong> backend/api_debug.log
          </Typography>
          
          <Typography variant="body2">
            Check the API server logs for detailed error information.
          </Typography>
        </Box>
      </MDBox>
    </Card>
  );
};

export default ChatApiDiagnostic;
