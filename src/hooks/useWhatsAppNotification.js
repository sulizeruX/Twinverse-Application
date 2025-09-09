import { useState, useCallback } from 'react';

/**
 * Custom hook for sending WhatsApp notifications
 * @returns {Object} Functions and state for sending WhatsApp notifications
 */
const useWhatsAppNotification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  /**
   * Send a WhatsApp notification
   * @param {string} phoneNumber - Recipient's phone number with country code
   * @param {string} message - Message content to send
   * @returns {Promise<Object>} Response data from server
   */
  const sendNotification = useCallback(async (phoneNumber, message) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
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
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp notification');
      }
      
      setSuccess({
        message: data.message,
        timestamp: new Date(),
        recipient: data.phone,
      });
      
      return data;
    } catch (err) {
      setError(err.message || 'Failed to send WhatsApp notification');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check WhatsApp server connection status
   */
  const checkServerStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/status');
      const data = await response.json();
      setServerStatus(data);
      return data;
    } catch (err) {
      setServerStatus({ status: 'error', error: err.message });
      return { status: 'error', error: err.message };
    }
  }, []);

  /**
   * Reset notification states
   */
  const resetState = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    sendNotification,
    checkServerStatus,
    resetState,
    loading,
    error,
    success,
    serverStatus,
  };
};

export default useWhatsAppNotification;
