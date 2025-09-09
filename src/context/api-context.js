import { createContext, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";

// Create context
const ApiContext = createContext();

// API endpoint configuration
const API_BASE_URL = "http://localhost:8007"; // Changed to match the FastAPI server port

export function ApiProvider({ children }) {
  const [facilityData, setFacilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConveyor, setSelectedConveyor] = useState(1); // Default to conveyor 1
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds refresh

  // Fetch all facility data
  const fetchFacilityData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/data`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setFacilityData(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch facility data:", err);
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for a specific conveyor
  const fetchConveyorData = async (conveyorId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/conveyor/${conveyorId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Failed to fetch data for conveyor ${conveyorId}:`, err);
      setError(err.message || "Failed to fetch conveyor data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for a specific category of a conveyor
  const fetchCategoryData = async (conveyorId, category) => {
    const validCategories = ["overall_facility", "production_data", "equipment_performance", "quality_control", "equipment_details"];
    
    if (!validCategories.includes(category)) {
      setError(`Invalid category: ${category}`);
      return null;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/conveyor/${conveyorId}/${category.replace("_", "-")}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Failed to fetch ${category} data for conveyor ${conveyorId}:`, err);
      setError(err.message || `Failed to fetch ${category} data`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Set up WebSocket connection for real-time updates
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`ws://localhost:8007/ws`);
      
      ws.onopen = () => {
        console.log("WebSocket connection established");
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setFacilityData(data);
          setError(null);
        } catch (err) {
          console.error("Error parsing WebSocket data:", err);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
      };
      
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        // Try to reconnect after a delay
        setTimeout(connectWebSocket, 3000);
      };
      
      return ws;
    } catch (err) {
      console.error("Failed to establish WebSocket connection:", err);
      setError("Failed to establish real-time connection");
      return null;
    }
  };

  // Initialize data fetching
  useEffect(() => {
    fetchFacilityData();
    
    // Set up polling as a fallback if WebSockets aren't supported
    const interval = setInterval(() => {
      fetchFacilityData();
    }, refreshInterval);
    
    // Try to establish WebSocket connection
    let ws = null;
    if ("WebSocket" in window) {
      ws = connectWebSocket();
    }
    
    // Clean up on unmount
    return () => {
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
    };
  }, [refreshInterval]);

  // Change the selected conveyor
  const selectConveyor = (conveyorId) => {
    if (conveyorId >= 1 && conveyorId <= 5) {
      setSelectedConveyor(conveyorId);
    } else {
      setError("Invalid conveyor ID. Must be between 1 and 5.");
    }
  };

  // Context value
  const value = {
    facilityData,
    loading,
    error,
    selectedConveyor,
    selectConveyor,
    fetchFacilityData,
    fetchConveyorData,
    fetchCategoryData,
    setRefreshInterval,
    refreshInterval,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

ApiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook for using the API context
export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}

export default ApiContext;
