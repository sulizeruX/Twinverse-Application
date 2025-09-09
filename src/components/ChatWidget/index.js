import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fab,
  Switch,
  FormControlLabel,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

// Material Dashboard components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';

// Styles
import './styles.css';

/**
 * ChatWidget Component
 * 
 * A floating AI chat assistant that can summarize dashboard data and answer questions
 */
const ChatWidget = ({ dashboardData = {} }) => {
  // State for chat management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your AI assistant. Ask me about the dashboard or for a status summary.', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [readResponsesAloud, setReadResponsesAloud] = useState(false);
  const recognition = useRef(null);
  
  // Dashboard data state
  const [hasData, setHasData] = useState(false);
  
  // Refs for auto-scrolling
  const messagesEndRef = useRef(null);
  
  // Check if dashboard data is available
  useEffect(() => {
    const dataAvailable = dashboardData && Object.keys(dashboardData).length > 0;
    setHasData(dataAvailable);
  }, [dashboardData]);
  
  // Effect to update welcome message based on data availability
  useEffect(() => {
    // Only update the welcome message if we're on the first message
    if (messages.length === 1 && messages[0].id === 1) {
      let welcomeMessage = 'Hello! I\'m your AI assistant.';
      
      if (hasData) {
        welcomeMessage += ' Ask me about the dashboard or for a status summary.';
      } else {
        welcomeMessage += ' I don\'t have access to dashboard data yet. Please navigate through the dashboard to collect data.';
      }
      
      setMessages([{ id: 1, text: welcomeMessage, sender: 'ai' }]);
    }
  }, [hasData, messages]);
  
  // Check if speech recognition is supported
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      setSpeechSupported(true);
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechSupported) return;
    
    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };
  
  // Text-to-speech function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Toggle chat widget
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Send message to backend
  const sendMessage = () => {
    if (!input.trim()) return;
    
    const messageText = input;
    setInput('');
    
    // Add user message to chat
    const newUserMessage = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Set loading state
    setLoading(true);
    
    // Check if we have dashboard data
    const hasDashboardData = dashboardData && Object.keys(dashboardData).length > 0;
    console.log('Sending message to API:', messageText);
    console.log('Dashboard data available:', hasDashboardData);
    
    if (hasDashboardData) {
      console.log('Dashboard data size:', JSON.stringify(dashboardData).length, 'bytes');
      console.log('Dashboard data keys:', Object.keys(dashboardData));
    }
    
    fetch('http://localhost:9000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageText,
        dashboardData: dashboardData || {}
      }),
    })
    .then(response => {
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        return response.text().then(errorText => {
          console.error('API error response:', errorText);
          throw new Error(`API error (${response.status}): ${errorText}`);
        });
      }
      
      return response.json();
    })
    .then(data => {
      console.log('API response received successfully');
      
      // Add AI response to chat
      const newAiMessage = { id: Date.now() + 1, text: data.reply, sender: 'ai' };
      setMessages(prev => [...prev, newAiMessage]);
      
      // Read response aloud if enabled
      if (readResponsesAloud) {
        speakText(data.reply);
      }
    })
    .catch(error => {
      console.error('Error sending message:', error);
      
      // Create a more informative error message
      const errorDetails = error.toString();
      const networkError = errorDetails.includes('NetworkError') || errorDetails.includes('Failed to fetch');
      
      let errorMessage;
      
      if (networkError) {
        errorMessage = `I couldn't connect to the AI backend server. Please make sure the backend is running at http://localhost:9000.
        
Error: ${errorDetails}

Troubleshooting:
1. Make sure the FastAPI server is running
2. Check the terminal for any backend errors
3. Visit the System Diagnostics page to test the connection`;
      } else {
        errorMessage = `Sorry, there was an error processing your request. 
        
Error: ${errorDetails}

Please check the System Diagnostics page to troubleshoot this issue.`;
      }
      
      // Add detailed error message
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: errorMessage, 
        sender: 'ai' 
      }]);
    })
    .finally(() => {
      setLoading(false);
    });
  };
  
  return (
    <div className="chat-widget-container">
      {/* Floating button */}
      {!isOpen && (
        <Fab
          color="primary"
          aria-label="chat"
          className="chat-fab"
          onClick={toggleChat}
          sx={{ position: 'relative' }}
        >
          {hasData && (
            <div className="data-indicator" 
              style={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: '#4caf50', 
                border: '2px solid white' 
              }}
            />
          )}
          <SmartToyIcon />
        </Fab>
      )}
      
      {/* Chat window */}
      {isOpen && (
        <Paper className="chat-window" elevation={3}>
          {/* Chat header */}
          <Box className="chat-header">
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                <SmartToyIcon />
              </Avatar>
              <Box>
                <MDTypography variant="h6" color="white" lineHeight={1}>
                  AI Assistant
                </MDTypography>
                {hasData && (
                  <MDTypography variant="caption" color="white" lineHeight={1}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: '#4caf50', 
                        display: 'inline-block',
                        marginRight: '4px'
                      }}></span>
                      Dashboard data connected
                    </span>
                  </MDTypography>
                )}
              </Box>
            </Box>
            <IconButton color="inherit" onClick={toggleChat}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Chat messages */}
          <Box className="chat-messages">
            {messages.map((message) => (
              <Box
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <Typography variant="body1">{message.text}</Typography>
              </Box>
            ))}
            {loading && (
              <Box className="message ai-message">
                <CircularProgress size={20} color="inherit" />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Chat controls */}
          <Box className="chat-controls">
            <Box className="chat-options">
              <Tooltip title={readResponsesAloud ? "Responses will be read aloud" : "Responses will be silent"}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={readResponsesAloud}
                      onChange={() => setReadResponsesAloud(!readResponsesAloud)}
                      color="primary"
                    />
                  }
                  label={<Box display="flex" alignItems="center">
                    <VolumeUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">Read responses</Typography>
                  </Box>}
                />
              </Tooltip>
            </Box>
            
            <Box className="chat-input-container">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                multiline
                maxRows={3}
                size="small"
              />
              {speechSupported && (
                <IconButton 
                  color={isListening ? "secondary" : "default"} 
                  onClick={toggleListening}
                  className="mic-button"
                >
                  {isListening ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              )}
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="send-button"
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </div>
  );
};

// PropTypes
ChatWidget.propTypes = {
  dashboardData: PropTypes.object
};

export default ChatWidget;
