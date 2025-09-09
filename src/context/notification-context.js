/**
 * Notification Context for managing system notifications
 * Handles Critical, Warning, and Non-Critical notifications
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = useCallback((notificationData) => {
    const newNotification = {
      id: Date.now() + Math.random(), // Simple ID generation
      timestamp: new Date(),
      acknowledged: false,
      ...notificationData
    };

    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  // Predefined notification types for common scenarios
  const addSplineStoppedNotification = useCallback((splineId, reason = 'Manual') => {
    return addNotification({
      type: 'warning',
      title: 'Spline Manually Stopped',
      message: `${splineId} has been ${reason.toLowerCase()} stopped from control panel`,
      source: 'Control Panel',
      splineId: splineId
    });
  }, [addNotification]);

  const addSplineStartedNotification = useCallback((splineId) => {
    return addNotification({
      type: 'non-critical',
      title: 'Spline Resumed',
      message: `${splineId} has been resumed and is now operational`,
      source: 'Control Panel',
      splineId: splineId
    });
  }, [addNotification]);

  const addSplinePerformanceWarning = useCallback((splineId, efficiency) => {
    return addNotification({
      type: 'warning',
      title: 'Spline Performance Issue',
      message: `${splineId} is operating at reduced efficiency (${efficiency}%)`,
      source: 'Performance Monitor',
      splineId: splineId
    });
  }, [addNotification]);

  const addSplineFailureNotification = useCallback((splineId) => {
    return addNotification({
      type: 'critical',
      title: 'Spline Complete Failure',
      message: `${splineId} has stopped functioning and requires immediate attention`,
      source: 'System Monitor',
      splineId: splineId
    });
  }, [addNotification]);

  const addStockWarning = useCallback ((level, material = 'production material') => {
    const type = level < 10 ? 'critical' : level < 25 ? 'warning' : 'non-critical';
    const title = level < 10 ? 'Stock Critically Low' : level < 25 ? 'Stock Running Low' : 'Stock Level Update';
    
    return addNotification({
      type: type,
      title: title,
      message: `${material} stock level is at ${level}%${level < 10 ? ' - immediate restocking required' : ''}`,
      source: 'Inventory Monitor',
      splineId: null
    });
  }, [addNotification]);

  const addMaintenanceNotification = useCallback((splineId, daysUntilDue) => {
    const type = daysUntilDue <= 1 ? 'warning' : 'non-critical';
    const urgency = daysUntilDue <= 1 ? 'due' : `due in ${daysUntilDue} days`;
    
    return addNotification({
      type: type,
      title: 'Maintenance Required',
      message: `Scheduled maintenance for ${splineId} is ${urgency}`,
      source: 'Maintenance System',
      splineId: splineId
    });
  }, [addNotification]);

  const addGlobalPauseNotification = useCallback((isPaused) => {
    return addNotification({
      type: 'warning',
      title: isPaused ? 'Global System Paused' : 'Global System Resumed',
      message: isPaused ? 
        'All production splines have been paused from control panel' : 
        'All production splines have been resumed',
      source: 'Control Panel',
      splineId: null
    });
  }, [addNotification]);

  const addSpeedChangeNotification = useCallback((newSpeed, oldSpeed) => {
    return addNotification({
      type: 'non-critical',
      title: 'Production Speed Changed',
      message: `Global production speed changed from ${oldSpeed}% to ${newSpeed}%`,
      source: 'Control Panel',
      splineId: null
    });
  }, [addNotification]);

  // Acknowledge notification
  const acknowledgeNotification = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, acknowledged: true } : notif
      )
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get notification counts
  const getNotificationCounts = useCallback(() => {
    return {
      all: notifications.length,
      critical: notifications.filter(n => n.type === 'critical').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      'non-critical': notifications.filter(n => n.type === 'non-critical').length,
      unacknowledged: notifications.filter(n => !n.acknowledged).length
    };
  }, [notifications]);
  
  // Generate a test notification (for testing auto-notification)
  const addTestNotification = useCallback((type = 'warning') => {
    const types = {
      critical: {
        title: 'Critical Test Alert',
        message: 'This is a test critical notification that will trigger an auto-WhatsApp message.',
        source: 'Test System'
      },
      warning: {
        title: 'Warning Test Alert',
        message: 'This is a test warning notification that will trigger an auto-WhatsApp message.',
        source: 'Test Monitor'
      },
      'non-critical': {
        title: 'Information Test Alert',
        message: 'This is a test informational notification that will trigger an auto-WhatsApp message.',
        source: 'Test Service'
      }
    };
    
    const notifData = types[type] || types.warning;
    
    return addNotification({
      type,
      ...notifData,
      splineId: type === 'non-critical' ? null : 'TestSpline'
    });
  }, [addNotification]);

  const value = {
    notifications,
    setNotifications,
    addNotification,
    acknowledgeNotification,
    clearNotification,
    clearAllNotifications,
    getNotificationCounts,
    // Predefined helpers
    addSplineStoppedNotification,
    addSplineStartedNotification,
    addSplinePerformanceWarning,
    addSplineFailureNotification,
    addStockWarning,
    addMaintenanceNotification,
    addGlobalPauseNotification,
    addSpeedChangeNotification,
    // Test helper
    addTestNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
