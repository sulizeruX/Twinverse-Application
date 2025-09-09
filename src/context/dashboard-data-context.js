import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create context
const DashboardDataContext = createContext({
  dashboardData: {},
  updateDashboardData: () => {},
});

/**
 * DashboardDataProvider
 * 
 * Context provider that stores and updates dashboard data for use by the ChatWidget
 */
export const DashboardDataProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState({});
  
  // Function to update dashboard data
  const updateDashboardData = (newData) => {
    setDashboardData(prevData => ({
      ...prevData,
      ...newData,
    }));
  };
  
  return (
    <DashboardDataContext.Provider value={{ dashboardData, updateDashboardData }}>
      {children}
    </DashboardDataContext.Provider>
  );
};

// PropTypes
DashboardDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useDashboardData hook
 * 
 * Custom hook to access the dashboard data context
 */
export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  
  return context;
};
