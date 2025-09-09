import { useState, useEffect } from "react";
import PropTypes from "prop-types";

// @mui components
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Alert,
  AlertTitle,
  Typography,
  Collapse,
  IconButton,
  Tooltip
} from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

// Hooks
import useWhatsAppNotification from "../../hooks/useWhatsAppNotification";

// Components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Local storage key
const PHONE_NUMBER_KEY = 'whatsapp_notification_phone';

/**
 * WhatsApp Notification Component
 * Allows sending WhatsApp notifications from the dashboard
 */
function WhatsAppNotification({ 
  buttonText = "Send WhatsApp Notification",
  variant = "contained",
  color = "success",
  size = "medium",
  defaultPhoneNumber = "",
  defaultMessage = "",
  fullWidth = false,
  onSuccess = () => {},
  onError = () => {}
}) {
  // State
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(() => {
    // First try the passed prop, then try localStorage, then use empty string
    if (defaultPhoneNumber) return defaultPhoneNumber;
    return localStorage.getItem(PHONE_NUMBER_KEY) || "";
  });
  const [message, setMessage] = useState(defaultMessage);
  const [phoneError, setPhoneError] = useState("");
  const [messageError, setMessageError] = useState("");
  
  // Custom hook for WhatsApp notifications
  const { 
    sendNotification, 
    checkServerStatus,
    resetState,
    loading, 
    error, 
    success, 
    serverStatus 
  } = useWhatsAppNotification();

  // Update phone number when defaultPhoneNumber prop changes
  useEffect(() => {
    if (defaultPhoneNumber) {
      setPhoneNumber(defaultPhoneNumber);
    }
  }, [defaultPhoneNumber]);

  // Check server status when dialog opens
  useEffect(() => {
    if (open) {
      checkServerStatus();
    }
  }, [open, checkServerStatus]);

  // Handle dialog open/close
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetState();
    // Reset validation errors
    setPhoneError("");
    setMessageError("");
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    
    // Validate phone number (basic validation - can be enhanced)
    if (!phoneNumber.trim()) {
      setPhoneError("Phone number is required");
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      setPhoneError("Please enter a valid phone number with country code");
      isValid = false;
    } else {
      setPhoneError("");
    }
    
    // Validate message
    if (!message.trim()) {
      setMessageError("Message is required");
      isValid = false;
    } else {
      setMessageError("");
    }
    
    return isValid;
  };

  // Handle notification submission
  const handleSendNotification = async () => {
    if (!validateForm()) return;
    
    // Save the phone number to localStorage for future use
    localStorage.setItem(PHONE_NUMBER_KEY, phoneNumber);
    
    const result = await sendNotification(phoneNumber, message);
    
    if (result.success) {
      onSuccess(result);
    } else {
      onError(result);
    }
  };

  return (
    <>
      <MDButton
        variant={variant}
        color={color}
        onClick={handleOpen}
        size={size}
        fullWidth={fullWidth}
        startIcon={<WhatsAppIcon />}
      >
        {buttonText}
      </MDButton>
      
      <Dialog 
        open={open} 
        onClose={loading ? undefined : handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WhatsAppIcon color="success" sx={{ mr: 1 }} />
            Send WhatsApp Notification
            
            <Box ml="auto">
              <Tooltip title="Check server status">
                <IconButton 
                  size="small" 
                  onClick={checkServerStatus} 
                  disabled={loading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* Server Status */}
          {serverStatus && (
            <Collapse in={Boolean(serverStatus)}>
              <Box mb={2}>
                <Alert 
                  severity={serverStatus.status === 'connected' ? 'success' : 'warning'}
                  action={
                    <IconButton size="small" onClick={() => checkServerStatus()}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <AlertTitle>
                    WhatsApp Server Status: {serverStatus.status === 'connected' ? 'Connected' : 'Disconnected'}
                  </AlertTitle>
                  {serverStatus.status !== 'connected' && serverStatus.error && (
                    <Typography variant="caption">
                      {serverStatus.error}. Check the server console for QR code to scan.
                    </Typography>
                  )}
                </Alert>
              </Box>
            </Collapse>
          )}
          
          <DialogContentText mb={2}>
            Enter the recipient's phone number with country code and your message.
          </DialogContentText>
          
          {/* Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <IconButton size="small" onClick={() => resetState()}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          {/* Success Message */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              action={
                <IconButton size="small" onClick={() => resetState()}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <AlertTitle>Success</AlertTitle>
              Message sent to {success.recipient}!
              <Typography variant="caption" display="block">
                {new Date(success.timestamp).toLocaleString()}
              </Typography>
            </Alert>
          )}
          
          {/* Form */}
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="Phone Number (with country code)"
            type="tel"
            fullWidth
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+12345678901"
            error={Boolean(phoneError)}
            helperText={phoneError || "Include country code (e.g., +1 for US)"}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="message"
            label="Message"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your notification message here"
            error={Boolean(messageError)}
            helperText={messageError}
            disabled={loading}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleClose} 
            color="primary"
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSendNotification} 
            color="success" 
            variant="contained"
            disabled={loading || (serverStatus && serverStatus.status !== 'connected')}
            startIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : success ? (
                <CheckCircleIcon />
              ) : error ? (
                <ErrorIcon />
              ) : (
                <WhatsAppIcon />
              )
            }
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// PropTypes
WhatsAppNotification.propTypes = {
  buttonText: PropTypes.string,
  variant: PropTypes.oneOf(["contained", "outlined", "text", "gradient"]),
  color: PropTypes.oneOf([
    "primary", "secondary", "info", "success", "warning", "error", "dark", "light"
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  defaultPhoneNumber: PropTypes.string,
  defaultMessage: PropTypes.string,
  fullWidth: PropTypes.bool,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

export default WhatsAppNotification;
