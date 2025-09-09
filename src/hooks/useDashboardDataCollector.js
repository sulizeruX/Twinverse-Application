import { useEffect } from 'react';
import { useDashboardData } from '../context/dashboard-data-context';

/**
 * Custom hook to update dashboard data from any component
 * 
 * @param {Object} data - Dashboard data to update
 * @param {string} source - Source component identifier
 */
const useDashboardDataCollector = (data, source = 'unknown') => {
  const { updateDashboardData } = useDashboardData();
  
  useEffect(() => {
    if (data) {
      // Add the data with a source identifier
      updateDashboardData({
        [`${source}`]: data,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [data, source, updateDashboardData]);
};

export default useDashboardDataCollector;
