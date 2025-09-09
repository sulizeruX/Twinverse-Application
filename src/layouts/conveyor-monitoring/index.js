import { useState, useEffect } from "react";
import { Grid, Menu, MenuItem, Fade, ListItemIcon, ListItemText } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import Icon from "@mui/material/Icon";

import { useApi } from "context/api-context";
import useDashboardDataCollector from "hooks/useDashboardDataCollector";
import ConveyorStatus from "./components/ConveyorStatus";
import ProductionMetrics from "./components/ProductionMetrics";
import EquipmentPerformance from "./components/EquipmentPerformance";
import QualityControl from "./components/QualityControl";
import FacilityOverview from "./components/FacilityOverview";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function ConveyorMonitoring() {
  const { 
    facilityData, 
    loading, 
    error, 
    selectedConveyor, 
    selectConveyor 
  } = useApi();
  const [errorMessage, setErrorMessage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuConveyorId, setMenuConveyorId] = useState(null);
  
  const handleMenuOpen = (event, conveyorId) => {
    setAnchorEl(event.currentTarget);
    setMenuConveyorId(conveyorId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuConveyorId(null);
  };

  const handleConveyorSelect = (conveyorId) => {
    selectConveyor(conveyorId);
    handleMenuClose();
  };

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      // Auto-dismiss error after 5 seconds
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Determine selected conveyor data
  const conveyorData = facilityData?.conveyor_belts?.[`conveyor_${selectedConveyor}`];
  const conveyorStatus = conveyorData?.status || "unknown";
  
  // Create summarized conveyor data for AI
  const conveyorSummary = conveyorData ? {
    conveyorId: selectedConveyor,
    status: conveyorStatus,
    timestamp: facilityData?.timestamp,
    metrics: {
      production: {
        rate: conveyorData.production_data?.production_rate?.current_rate || 0,
        efficiency: conveyorData.production_data?.efficiency?.current_percentage || 0
      },
      quality: {
        dimensionalAccuracy: conveyorData.quality_control?.quality_metrics?.dimensional_accuracy || 0,
        defectRate: conveyorData.quality_control?.defect_rate?.current_percentage || 0
      },
      equipment: {
        uptimePercentage: conveyorData.equipment_performance?.uptime_downtime?.uptime_percentage || 0,
        maintenanceStatus: conveyorData.equipment_performance?.maintenance?.status || "unknown"
      },
      facility: {
        temperature: conveyorData.overall_facility?.temperature || 0,
        powerUsage: conveyorData.overall_facility?.power_usage?.current_kw || 0
      }
    }
  } : { conveyorId: selectedConveyor, status: "no data" };
  
  // Use the data collector hook to make this data available to the ChatWidget
  useDashboardDataCollector(conveyorSummary, 'conveyor-monitoring');
  
  // Create array of conveyor buttons with dropdown menu
  const conveyorButtons = Array.from({ length: 5 }, (_, i) => {
    const conveyorId = i + 1;
    const isSelected = selectedConveyor === conveyorId;
    const isMenuOpen = Boolean(anchorEl) && menuConveyorId === conveyorId;
    
    // Determine button color based on conveyor status
    let color;
    if (facilityData?.conveyor_belts?.[`conveyor_${conveyorId}`]?.status === "operational") {
      color = isSelected ? "success" : "light";
    } else if (facilityData?.conveyor_belts?.[`conveyor_${conveyorId}`]?.status === "faulty") {
      color = isSelected ? "warning" : "light";
    } else {
      color = isSelected ? "error" : "light"; // non-operational
    }
    
    return (
      <Grid item key={conveyorId}>
        <MDButton
          variant={isSelected ? "contained" : "outlined"}
          color={color}
          onClick={(event) => handleMenuOpen(event, conveyorId)}
          endIcon={<Icon>arrow_drop_down</Icon>}
        >
          Conveyor {conveyorId}
        </MDButton>
      </Grid>
    );
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {errorMessage && (
          <MDAlert color="error" dismissible>
            {errorMessage}
          </MDAlert>
        )}

        {loading && !facilityData ? (
          <MDBox display="flex" justifyContent="center">
            <MDTypography variant="h4" fontWeight="medium" color="text">
              Loading facility data...
            </MDTypography>
          </MDBox>
        ) : (
          <>
            <MDBox mb={3}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <MDTypography variant="h4" fontWeight="medium">
                    Conveyor Belt Monitoring
                  </MDTypography>
                </Grid>
                {conveyorButtons}
                <Menu
                  id="conveyor-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  TransitionComponent={Fade}
                  MenuListProps={{
                    'aria-labelledby': 'conveyor-button',
                  }}
                >
                  <MenuItem disabled>
                    <ListItemText primary="Select Conveyor Belt" />
                  </MenuItem>
                  {Array.from({ length: 5 }, (_, i) => {
                    const conveyorId = i + 1;
                    let statusColor, statusIcon, statusText;
                    
                    const status = facilityData?.conveyor_belts?.[`conveyor_${conveyorId}`]?.status;
                    
                    if (status === "operational") {
                      statusColor = "success";
                      statusIcon = "check_circle";
                      statusText = "Operational";
                    } else if (status === "faulty") {
                      statusColor = "warning";
                      statusIcon = "warning";
                      statusText = "Faulty";
                    } else {
                      statusColor = "error";
                      statusIcon = "error";
                      statusText = "Non-operational";
                    }
                    
                    return (
                      <MenuItem 
                        key={conveyorId} 
                        onClick={() => handleConveyorSelect(conveyorId)}
                        selected={selectedConveyor === conveyorId}
                      >
                        <ListItemIcon>
                          <Icon sx={{ color: statusColor === "light" ? "inherit" : `${statusColor}.main` }}>
                            {statusIcon}
                          </Icon>
                        </ListItemIcon>
                        <ListItemText>
                          Conveyor {conveyorId} - <span style={{ color: statusColor === "light" ? "inherit" : `${statusColor}` }}>{statusText}</span>
                        </ListItemText>
                      </MenuItem>
                    );
                  })}
                </Menu>
              </Grid>
            </MDBox>

            {conveyorData ? (
              <>
                <MDBox mb={3}>
                  <ConveyorStatus
                    status={conveyorStatus}
                    selectedConveyor={selectedConveyor}
                    timestamp={facilityData?.timestamp}
                  />
                </MDBox>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <MDBox mb={3}>
                      <FacilityOverview 
                        data={conveyorData.overall_facility} 
                        conveyorStatus={conveyorStatus}
                      />
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} lg={6}>
                    <MDBox mb={3}>
                      <ProductionMetrics 
                        data={conveyorData.production_data} 
                        conveyorStatus={conveyorStatus}
                      />
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12} lg={6}>
                    <MDBox mb={3}>
                      <QualityControl 
                        data={conveyorData.quality_control} 
                        conveyorStatus={conveyorStatus}
                      />
                    </MDBox>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <MDBox>
                      <EquipmentPerformance 
                        performanceData={conveyorData.equipment_performance}
                        equipmentData={conveyorData.equipment_details}
                        conveyorStatus={conveyorStatus}
                      />
                    </MDBox>
                  </Grid>
                </Grid>
              </>
            ) : (
              <MDBox display="flex" justifyContent="center">
                <MDTypography variant="h4" fontWeight="medium" color="error">
                  No data available for Conveyor {selectedConveyor}
                </MDTypography>
              </MDBox>
            )}
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ConveyorMonitoring;
