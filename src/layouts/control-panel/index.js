import { useState, useEffect } from "react";

// Material Dashboard 2 React contexts
import { useNotification } from "../../context/notification-context";
import {
  Grid,
  Card,
  FormControlLabel,
  Switch,
  Button,
  TextField,
  Slider,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Control Panel components
import GlobalControls from "./components/GlobalControls";
import SplineControls from "./components/SplineControls";
import SpeedControl from "./components/SpeedControl";

// API URL for the control API
// Use environment variable to determine if we're in Docker or development
const CONTROL_API_URL = process.env.REACT_APP_MOVABLE_API_URL || "http://localhost:8000";
console.log("Control API URL:", CONTROL_API_URL);

function ControlPanel() {
  const { 
    addSplineStoppedNotification, 
    addSplineStartedNotification, 
    addGlobalPauseNotification,
    addSpeedChangeNotification 
  } = useNotification();
  
  const [globalPauseState, setGlobalPauseState] = useState(false);
  const [splines, setSplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speed, setSpeed] = useState(100);
  
  // Fetch initial state on component mount
  useEffect(() => {
    fetchSplines();
  }, []);

  // Fetch all splines and their states - using your existing API endpoints
  const fetchSplines = async () => {
    try {
      setLoading(true);
      console.log("Fetching splines data from:", `${CONTROL_API_URL}/splines`);
      
      const response = await fetch(`${CONTROL_API_URL}/splines`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Successfully received data:", data);
      
      // Use your existing API response format
      setGlobalPauseState(data.global_pause || false);
      
      // Convert splines object to array for easier rendering
      const splinesArray = Object.entries(data.splines || {}).map(([id, paused]) => ({
        id,
        paused
      }));
      
      setSplines(splinesArray);
      
      // If no splines exist, create default ones
      if (splinesArray.length === 0) {
        console.log("No splines found, creating default splines...");
        setTimeout(createDefaultSplines, 1000);
      }
      
      setError(null);
    } catch (err) {
      console.error("Failed to fetch splines:", err);
      
      // Provide specific error messages
      let errorMessage = "Failed to connect to API";
      if (err.message.includes("Failed to fetch")) {
        errorMessage = `Cannot connect to MovableAPI server. Please check if it's running at ${CONTROL_API_URL}`;
      } else if (err.message.includes("cors")) {
        errorMessage = "CORS error. The server is not allowing cross-origin requests.";
      } else {
        errorMessage = `API Error: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Show default splines for demo purposes
      const defaultSplines = ['Spline1', 'Spline2', 'Spline3', 'Spline4', 'Spline5'].map(id => ({
        id,
        paused: false
      }));
      setSplines(defaultSplines);
      setGlobalPauseState(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Create some default splines if none exist
  const createDefaultSplines = async () => {
    try {
      // Using your naming convention: conveyor 1 = Spline1, conveyor 2 = Spline2, etc.
      const defaultSplines = ['Spline1', 'Spline2', 'Spline3', 'Spline4', 'Spline5'];
      
      // Create each default spline
      for (const splineId of defaultSplines) {
        await fetch(`${CONTROL_API_URL}/pause_spline/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            spline_id: splineId, 
            paused: false 
          })
        });
        console.log(`Created spline: ${splineId}`);
      }
      
      // Fetch the splines again to update the UI
      fetchSplines();
    } catch (err) {
      console.error("Failed to create default splines:", err);
      setError(err.message || "Failed to create default splines");
    }
  };

  // Toggle global pause state - using your existing API endpoint
  const toggleGlobalPause = async () => {
    try {
      const newPauseState = !globalPauseState;
      console.log(`Setting global pause state to: ${newPauseState}`);
      
      // Use your existing /pause/ endpoint with query parameter
      const response = await fetch(`${CONTROL_API_URL}/pause/?paused=${newPauseState}`, {
        method: 'POST',
        mode: 'cors',
        // Remove JSON headers to avoid CORS preflight OPTIONS request
        // since we're using query parameters, not JSON body
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Global pause response:', data);
      
      // Update state based on the response
      setGlobalPauseState(newPauseState);
      
      // Add notification for global pause/resume
      addGlobalPauseNotification(newPauseState);
      
      // Refresh splines to get updated states
      setTimeout(fetchSplines, 500);
    } catch (err) {
      console.error("Failed to toggle global pause:", err);
      setError(`Failed to toggle pause: ${err.message}`);
      
      // Update the UI anyway for better user experience
      setGlobalPauseState(!globalPauseState);
    }
  };  // Toggle individual spline pause state with better error handling
  const toggleSplinePause = async (splineId, currentState) => {
    try {
      const newState = !currentState;
      console.log(`Attempting to set spline ${splineId} pause state to: ${newState}`);
      
      const response = await fetch(`${CONTROL_API_URL}/pause_spline/`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          spline_id: splineId, 
          paused: newState 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Spline pause response:', data);
      
      // Immediately update the UI for better responsiveness
      setSplines(prevSplines => 
        prevSplines.map(spline => 
          spline.id === splineId ? { ...spline, paused: newState } : spline
        )
      );
      
      // Add notification for spline pause/resume
      if (newState) {
        addSplineStoppedNotification(splineId, 'Manual');
      } else {
        addSplineStartedNotification(splineId);
      }
      
      // Also refresh all splines after a delay to ensure consistency
      setTimeout(fetchSplines, 1000);
    } catch (err) {
      console.error(`Failed to toggle spline ${splineId}:`, err);
      setError(`Failed to toggle spline ${splineId}: ${err.message}`);
      
      // Still update the UI for better user experience
      setSplines(prevSplines => 
        prevSplines.map(spline => 
          spline.id === splineId ? { ...spline, paused: !currentState } : spline
        )
      );
    }
  };

  // Update speed - using the correct GET endpoint format
  const updateSpeed = async (newSpeed) => {
    try {
      // Make sure the speed is within bounds
      const validSpeed = Math.max(0, Math.min(200, Math.round(newSpeed)));
      const oldSpeed = speed;
      console.log(`Setting speed to: ${validSpeed}`);
      
      const response = await fetch(`${CONTROL_API_URL}/speed/${validSpeed}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Speed response:', data);
      
      if (data.status === "ok") {
        setSpeed(validSpeed);
        console.log(`Speed updated to: ${validSpeed}`);
        
        // Add notification for speed change (only if significantly different)
        if (Math.abs(validSpeed - oldSpeed) >= 5) {
          addSpeedChangeNotification(validSpeed, oldSpeed);
        }
      }
    } catch (err) {
      console.error("Failed to update speed:", err);
      setError(err.message || "Failed to update speed");
      
      // Update the UI anyway for better user experience in case of network issues
      setSpeed(newSpeed);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Display any errors */}
          {error && (
            <Grid item xs={12}>
              <MDAlert color="error" dismissible>
                <MDTypography variant="body2" color="white">
                  {error}
                </MDTypography>
              </MDAlert>
            </Grid>
          )}

          {/* Global Controls */}
          <Grid item xs={12} lg={6}>
            <GlobalControls 
              globalPauseState={globalPauseState} 
              toggleGlobalPause={toggleGlobalPause} 
              loading={loading}
            />
          </Grid>

          {/* Speed Control */}
          <Grid item xs={12} lg={6}>
            <SpeedControl 
              speed={speed}
              updateSpeed={updateSpeed}
            />
          </Grid>

          {/* Spline Controls */}
          <Grid item xs={12}>
            <SplineControls 
              splines={splines}
              toggleSplinePause={toggleSplinePause}
              globalPauseState={globalPauseState}
              loading={loading}
            />
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ControlPanel;
