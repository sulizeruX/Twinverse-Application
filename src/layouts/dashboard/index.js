/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.twinverse.com/product/material-dashboard-react
* Copyright 2023 Twinverse

Coded by www.twinverse.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { Chip, Divider } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Custom context and hooks
import { useApi } from "context/api-context";
import useDashboardDataCollector from "hooks/useDashboardDataCollector";

// Dashboard components
import FacilityHealthCard from "layouts/dashboard/components/FacilityHealthCard";
import ConveyorOverview from "layouts/dashboard/components/ConveyorOverview";

function Dashboard() {
  const { facilityData, loading, error, selectConveyor } = useApi();
  const [errorMessage, setErrorMessage] = useState(null);

  // Total number of operational conveyors
  const operationalCount = Object.values(facilityData?.conveyor_belts || {}).filter(
    (conveyor) => conveyor.status === "operational"
  ).length;

  // Total number of faulty conveyors
  const faultyCount = Object.values(facilityData?.conveyor_belts || {}).filter(
    (conveyor) => conveyor.status === "faulty"
  ).length;

  // Total number of non-operational conveyors
  const nonOperationalCount = Object.values(facilityData?.conveyor_belts || {}).filter(
    (conveyor) => conveyor.status === "non-operational"
  ).length;

  // Calculate total production rate across all conveyors
  const totalProductionRate = Object.values(facilityData?.conveyor_belts || {}).reduce(
    (sum, conveyor) => sum + (conveyor.production_data?.production_rate?.current_rate || 0),
    0
  );

  // Calculate average quality across operational conveyors
  const operationalConveyors = Object.values(facilityData?.conveyor_belts || {}).filter(
    (conveyor) => conveyor.status === "operational" || conveyor.status === "faulty"
  );
  
  const averageQuality = operationalConveyors.length
    ? operationalConveyors.reduce(
        (sum, conveyor) => sum + (conveyor.quality_control?.quality_metrics?.dimensional_accuracy || 0),
        0
      ) / operationalConveyors.length
    : 0;

  // Calculate average power usage across all conveyors
  const totalPowerUsage = Object.values(facilityData?.conveyor_belts || {}).reduce(
    (sum, conveyor) => sum + (conveyor.overall_facility?.power_usage?.current_kw || 0),
    0
  );
  
  // Format timestamp
  const formattedTime = facilityData?.timestamp 
    ? new Date(facilityData.timestamp).toLocaleString() 
    : "Unknown";
    
  // Collect dashboard data for AI assistant
  const dashboardSummary = {
    facilityStatus: facilityData?.facility_status || 'unknown',
    conveyorCount: {
      total: Object.keys(facilityData?.conveyor_belts || {}).length,
      operational: operationalCount,
      faulty: faultyCount,
      nonOperational: nonOperationalCount
    },
    metrics: {
      totalProductionRate,
      averageQuality: parseFloat(averageQuality.toFixed(1)),
      totalPowerUsage: parseFloat(totalPowerUsage.toFixed(1))
    },
    lastUpdated: formattedTime
  };
  
  // Use the data collector hook to make this data available to the ChatWidget
  useDashboardDataCollector(dashboardSummary, 'dashboard');

  // Error handling
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

  // Navigate to detailed view when clicking on a conveyor
  const handleConveyorClick = (conveyorId) => {
    selectConveyor(conveyorId);
    window.location.href = "#/conveyor-monitoring";
  };

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
                    Industrial Facility Overview
                  </MDTypography>
                </Grid>
                <Grid item>
                  <Chip 
                    label={`Last updated: ${formattedTime}`} 
                    variant="outlined" 
                    size="small"
                  />
                </Grid>
              </Grid>
            </MDBox>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="success"
                    icon="check_circle"
                    title="Operational Conveyors"
                    count={operationalCount}
                    percentage={{
                      color: "success",
                      amount: `${Math.round((operationalCount / 5) * 100)}%`,
                      label: "of total conveyors",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="warning"
                    icon="warning"
                    title="Faulty Conveyors"
                    count={faultyCount}
                    percentage={{
                      color: "warning",
                      amount: `${Math.round((faultyCount / 5) * 100)}%`,
                      label: "of total conveyors",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="error"
                    icon="error"
                    title="Non-Operational"
                    count={nonOperationalCount}
                    percentage={{
                      color: "error",
                      amount: `${Math.round((nonOperationalCount / 5) * 100)}%`,
                      label: "of total conveyors",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="info"
                    icon="speed"
                    title="Total Production Rate"
                    count={`${totalProductionRate}`}
                    percentage={{
                      color: "info",
                      amount: "units/hour",
                      label: "current rate",
                    }}
                  />
                </MDBox>
              </Grid>
            </Grid>
            
            <MDBox mt={4.5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mb={3}>
                    <FacilityHealthCard
                      color="success"
                      title="Average Quality Rating"
                      count={`${averageQuality.toFixed(1)}%`}
                      percentage={{
                        color: averageQuality > 90 ? "success" : averageQuality > 75 ? "warning" : "error",
                        amount: averageQuality > 90 ? "Good" : averageQuality > 75 ? "Warning" : "Critical",
                        label: "quality status"
                      }}
                      icon="verified"
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mb={3}>
                    <FacilityHealthCard
                      color="primary"
                      title="Total Power Consumption"
                      count={`${totalPowerUsage.toFixed(1)} kW`}
                      percentage={{
                        color: "info",
                        amount: "",
                        label: "real-time measurement"
                      }}
                      icon="bolt"
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mb={3}>
                    <FacilityHealthCard
                      color="warning"
                      title="Environment Status"
                      count="Normal"
                      percentage={{
                        color: "success",
                        amount: "",
                        label: "All metrics within range"
                      }}
                      icon="thermostat"
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
            
            <MDBox mt={3}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Conveyor Status Overview
                  </MDTypography>
                  <MDTypography variant="button" color="text">
                    Click on a conveyor for detailed monitoring
                  </MDTypography>
                  
                  <MDBox mt={3}>
                    <Grid container spacing={3}>
                      {facilityData && Object.entries(facilityData.conveyor_belts).map(([key, conveyor]) => {
                        const conveyorId = parseInt(key.split('_')[1]);
                        return (
                          <Grid item xs={12} md={6} lg={4} key={key}>
                            <ConveyorOverview 
                              conveyorId={conveyorId}
                              status={conveyor.status}
                              productionRate={conveyor.production_data?.production_rate?.current_rate || 0}
                              temperature={conveyor.overall_facility?.temperature || 0}
                              quality={conveyor.quality_control?.quality_metrics?.dimensional_accuracy || 0}
                              uptime={conveyor.equipment_performance?.uptime_downtime?.uptime_percentage || 0}
                              onClick={() => handleConveyorClick(conveyorId)}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </MDBox>
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
