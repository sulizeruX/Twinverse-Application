/**
 * WhatsApp Notification Service
 * 
 * This module provides functionality to automatically send WhatsApp notifications
 * for new system notifications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../context/notification-context';

// Default WhatsApp number to use if nothing saved in localStorage
const DEFAULT_PHONE_NUMBER = '+96893885660';

// LocalStorage keys
const PHONE_NUMBER_KEY = 'whatsapp_notification_phone';
const AUTO_NOTIFY_ENABLED_KEY = 'whatsapp_auto_notify_enabled';

/**
 * Hook to automatically send WhatsApp notifications for new system notifications
 */
const useAutoWhatsAppNotifications = () => {
  const { notifications } = useNotification();
  // Use useRef for storing processed IDs to prevent re-renders
  const processedNotificationsRef = useRef(new Set());
  const [lastSentNotification, setLastSentNotification] = useState(null);
  
  // Initialize state from localStorage with defaults if not available
  const [autoNotifyEnabled, setAutoNotifyEnabledState] = useState(() => {
    const savedSetting = localStorage.getItem(AUTO_NOTIFY_ENABLED_KEY);
    return savedSetting !== null ? savedSetting === 'true' : false; // Default to disabled
  });
  
  const [phoneNumber, setPhoneNumberState] = useState(() => {
    return localStorage.getItem(PHONE_NUMBER_KEY) || DEFAULT_PHONE_NUMBER;
  });
  
  const [sendingStatus, setSendingStatus] = useState({ sending: false, error: null });
  // Keep track of the last seen notification count to detect new ones
  const lastNotificationCountRef = useRef(0);
  
  // Custom setters that update localStorage
  const setAutoNotifyEnabled = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(autoNotifyEnabled) : value;
    localStorage.setItem(AUTO_NOTIFY_ENABLED_KEY, newValue.toString());
    setAutoNotifyEnabledState(newValue);
  }, [autoNotifyEnabled]);
  
  const setPhoneNumber = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(phoneNumber) : value;
    localStorage.setItem(PHONE_NUMBER_KEY, newValue);
    setPhoneNumberState(newValue);
  }, [phoneNumber]);

  // Send WhatsApp notification
  const sendWhatsAppNotification = useCallback(async (notification) => {
    if (!autoNotifyEnabled) return;

    setSendingStatus({ sending: true, error: null });
    
    try {
      const notificationType = notification.type.toUpperCase();
      let emoji = '📢';
      
      // Select emoji based on notification type
      if (notification.type === 'critical') emoji = '🚨';
      else if (notification.type === 'warning') emoji = '⚠️';
      else if (notification.type === 'non-critical') emoji = 'ℹ️';
      
      // Format message
      const message = `${emoji} ${notificationType} NOTIFICATION:\n\n${notification.title}\n\n${notification.message}${notification.splineId ? `\n\nSpline: ${notification.splineId}` : ''}\n\nSource: ${notification.source}`;
      
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
      
      setLastSentNotification({
        id: notification.id,
        timestamp: new Date(),
        success: true,
        title: notification.title
      });
      
      setSendingStatus({ sending: false, error: null });
      
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      
      setSendingStatus({ 
        sending: false, 
        error: error.message || 'Failed to send WhatsApp notification' 
      });
      
      return false;
    }
  }, [phoneNumber, autoNotifyEnabled]);

  // Process new notifications only
  useEffect(() => {
    // Only process if we have more notifications than before (meaning new ones were added)
    if (notifications.length > lastNotificationCountRef.current) {
      // Update the count reference
      lastNotificationCountRef.current = notifications.length;
      
      // Get only the most recent notification that hasn't been processed yet
      const newNotifications = notifications
        .filter(notification => !processedNotificationsRef.current.has(notification.id))
        // Sort by timestamp descending (newest first)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (newNotifications.length > 0) {
        (async () => {
          // Only process the most recent notification (index 0)
          const newNotification = newNotifications[0];
          
          // Add to the processed set to prevent duplication
          processedNotificationsRef.current.add(newNotification.id);
          
          console.log(`Auto-sending WhatsApp for new notification: ${newNotification.title}`);
          
          // Send notification
          await sendWhatsAppNotification(newNotification);
        })();
      }
    }
  }, [notifications, sendWhatsAppNotification]);

  // Reset processed notifications
  const resetProcessedNotifications = useCallback(() => {
    processedNotificationsRef.current = new Set();
    console.log('Reset processed notifications history');
  }, []);
  
  return {
    autoNotifyEnabled,
    setAutoNotifyEnabled,
    phoneNumber,
    setPhoneNumber,
    lastSentNotification,
    sendingStatus,
    resetProcessedNotifications
  };
};

export default useAutoWhatsAppNotifications;
