import PropTypes from "prop-types";
import { Card, Icon, Chip, Grid, Divider } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useApi } from "context/api-context";

function ConveyorStatus({ status, selectedConveyor, timestamp }) {
  const { facilityData } = useApi();
  
  // Format the timestamp for display
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : "Unknown";

  // Get conveyor data
  const conveyorData = facilityData?.conveyor_belts?.[`conveyor_${selectedConveyor}`];
  
  // Determine status color and icon
  let statusColor = "info";
  let statusIcon = "help";
  let statusText = "Unknown";

  switch (status) {
    case "operational":
      statusColor = "success";
      statusIcon = "check_circle";
      statusText = "Operational";
      break;
    case "faulty":
      statusColor = "warning";
      statusIcon = "warning";
      statusText = "Faulty";
      break;
    case "non-operational":
      statusColor = "error";
      statusIcon = "error";
      statusText = "Non-Operational";
      break;
    default:
      break;
  }

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium">
              Conveyor Belt {selectedConveyor}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Last updated: {formattedTime}
            </MDTypography>
          </MDBox>
          <Chip
            icon={<Icon>{statusIcon}</Icon>}
            label={statusText}
            color={statusColor}
            size="medium"
            sx={{ height: 30, fontSize: "0.875rem" }}
          />
        </MDBox>
        
        <Divider sx={{ my: 2 }} />
        
        <MDBox mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MDTypography variant="body2" color="text" fontWeight="bold">
                Status Summary:
              </MDTypography>
              <MDTypography variant="body2" color="text">
                {status === "operational" && (
                  "This conveyor is operating normally with all metrics within acceptable ranges."
                )}
                {status === "faulty" && (
                  "This conveyor is operational but showing abnormal metrics. Maintenance recommended."
                )}
                {status === "non-operational" && (
                  "This conveyor is currently not operational. All metrics show zero values."
                )}
                {status === "unknown" && (
                  "Status information not available."
                )}
              </MDTypography>
            </Grid>
            
            {conveyorData && (
              <>
                <Grid item xs={12} md={4}>
                  <MDBox>
                    <MDTypography variant="caption" fontWeight="bold" color="text">
                      Production Rate
                    </MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDBox mr={1}>
                        <Icon color={status === "operational" ? "success" : status === "faulty" ? "warning" : "error"}>
                          speed
                        </Icon>
                      </MDBox>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        {status !== "non-operational" 
                          ? `${conveyorData?.production_data?.production_rate?.current_rate || 0} units/hour` 
                          : "0 units/hour"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <MDBox>
                    <MDTypography variant="caption" fontWeight="bold" color="text">
                      Current Temperature
                    </MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDBox mr={1}>
                        <Icon color={status === "operational" ? "success" : status === "faulty" ? "warning" : "error"}>
                          thermostat
                        </Icon>
                      </MDBox>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        {status !== "non-operational" 
                          ? `${conveyorData?.overall_facility?.temperature || 0}°C` 
                          : "0°C"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <MDBox>
                    <MDTypography variant="caption" fontWeight="bold" color="text">
                      Quality Rating
                    </MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDBox mr={1}>
                        <Icon color={status === "operational" ? "success" : status === "faulty" ? "warning" : "error"}>
                          verified
                        </Icon>
                      </MDBox>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        {status !== "non-operational" 
                          ? `${conveyorData?.quality_control?.quality_metrics?.dimensional_accuracy || 0}%` 
                          : "0%"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <MDBox>
                    <MDTypography variant="caption" fontWeight="bold" color="text">
                      Uptime
                    </MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDBox mr={1}>
                        <Icon color={status === "operational" ? "success" : status === "faulty" ? "warning" : "error"}>
                          av_timer
                        </Icon>
                      </MDBox>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        {status !== "non-operational" 
                          ? `${conveyorData?.equipment_performance?.uptime_downtime?.uptime_percentage || 0}%` 
                          : "0%"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <MDBox>
                    <MDTypography variant="caption" fontWeight="bold" color="text">
                      Power Consumption
                    </MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <MDBox mr={1}>
                        <Icon color={status === "operational" ? "success" : status === "faulty" ? "warning" : "error"}>
                          bolt
                        </Icon>
                      </MDBox>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        {status !== "non-operational" 
                          ? `${conveyorData?.overall_facility?.power_usage?.current_kw || 0} kW` 
                          : "0 kW"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Grid>
              </>
            )}
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// PropTypes
ConveyorStatus.propTypes = {
  status: PropTypes.string.isRequired,
  selectedConveyor: PropTypes.number.isRequired,
  timestamp: PropTypes.string,
};

export default ConveyorStatus;
