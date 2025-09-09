import PropTypes from "prop-types";
import { Card, Grid, Divider, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";

function EquipmentPerformance({ performanceData, equipmentData, conveyorStatus }) {
  // Data for chart
  const operatingConditionsChart = {
    labels: ["Temperature", "Pressure", "Vibration", "Noise", "Load"],
    datasets: {
      label: "Value",
      data: [
        performanceData.operating_conditions.temperature,
        performanceData.operating_conditions.pressure,
        performanceData.operating_conditions.vibration * 5, // Scale up for visibility
        performanceData.operating_conditions.noise_level / 2, // Scale down for visibility
        performanceData.operating_conditions.load_percentage
      ],
    },
  };

  // Helper function to determine color based on uptime
  const getUptimeColor = (value) => {
    if (conveyorStatus === "non-operational") return "dark";
    return value < 70 ? "error" : value < 85 ? "warning" : "success";
  };

  // Helper function for maintenance needed indicator
  const getMaintenanceIcon = (needed) => {
    return needed ? (
      <Icon fontSize="small" color="error">warning</Icon>
    ) : (
      <Icon fontSize="small" color="success">check_circle</Icon>
    );
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Equipment Performance
        </MDTypography>
        
        <MDBox mt={3}>
          <Grid container spacing={3}>
            {/* Uptime/Downtime Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={2}>
                  <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                    Uptime / Downtime
                  </MDTypography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h4" 
                          fontWeight="medium"
                          color={getUptimeColor(performanceData.uptime_downtime.uptime_percentage)}
                        >
                          {performanceData.uptime_downtime.uptime_percentage}%
                        </MDTypography>
                        <MDTypography variant="button" color="text">
                          Uptime
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6}>
                      <MDBox textAlign="center">
                        <MDTypography variant="h4" fontWeight="medium">
                          {performanceData.uptime_downtime.mean_time_between_failures}h
                        </MDTypography>
                        <MDTypography variant="button" color="text">
                          MTBF
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MDBox>
                        <MDTypography variant="button" color="text" display="block">
                          Planned Downtime:
                        </MDTypography>
                        <MDTypography variant="button" fontWeight="medium">
                          {performanceData.uptime_downtime.planned_downtime} hrs/day
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6}>
                      <MDBox>
                        <MDTypography variant="button" color="text" display="block">
                          Unplanned Downtime:
                        </MDTypography>
                        <MDTypography 
                          variant="button" 
                          fontWeight="medium"
                          color={performanceData.uptime_downtime.unplanned_downtime > 2 ? "error" : "dark"}
                        >
                          {performanceData.uptime_downtime.unplanned_downtime} hrs/day
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
            
            {/* Operating Conditions Chart */}
            <Grid item xs={12} md={6}>
              <ReportsBarChart
                color="info"
                title="Operating Conditions"
                description="Key parameters from the equipment sensors"
                chart={operatingConditionsChart}
                date={`Within Spec: ${performanceData.parameters.temp_pressure_vibration.within_spec ? 'Yes' : 'No'}`}
              />
            </Grid>
            
            {/* Time Per Hour Distribution */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={2}>
                  <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                    Time Distribution (minutes per hour)
                  </MDTypography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <MDBox textAlign="center">
                        <MDTypography variant="h5" fontWeight="medium" color="success">
                          {performanceData.time_per_hour.processing_time}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Processing Time
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium" 
                          color={performanceData.time_per_hour.idle_time > 10 ? "warning" : "dark"}
                        >
                          {performanceData.time_per_hour.idle_time}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Idle Time
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={performanceData.time_per_hour.setup_time > 10 ? "warning" : "dark"}
                        >
                          {performanceData.time_per_hour.setup_time}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Setup Time
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={performanceData.time_per_hour.maintenance_time > 5 ? "warning" : "dark"}
                        >
                          {performanceData.time_per_hour.maintenance_time}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Maintenance Time
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
            
            {/* Equipment Details */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={2}>
                  <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                    Equipment Details
                  </MDTypography>
                  
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="medium">
                            Equipment
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="medium">
                            Usage Hours
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="medium">
                            Performance
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="medium">
                            Wear %
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="medium">
                            Maintenance
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="medium">
                            Downtime (hrs)
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(equipmentData).map(([equipment, data]) => (
                        <TableRow key={equipment}>
                          <TableCell>
                            <MDTypography variant="button">{equipment}</MDTypography>
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="button" fontWeight="medium">
                              {data.usage_hours}
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            <MDTypography 
                              variant="button" 
                              fontWeight="medium"
                              color={getUptimeColor(data.performance_score)}
                            >
                              {data.performance_score}%
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            <MDTypography 
                              variant="button" 
                              fontWeight="medium"
                              color={data.wear_percentage > 75 ? "error" : data.wear_percentage > 50 ? "warning" : "success"}
                            >
                              {data.wear_percentage}%
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            {getMaintenanceIcon(data.maintenance_needed)}
                          </TableCell>
                          <TableCell>
                            <MDTypography 
                              variant="button" 
                              fontWeight="medium"
                              color={data.downtime > 2 ? "error" : "dark"}
                            >
                              {data.downtime}
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// PropTypes
EquipmentPerformance.propTypes = {
  performanceData: PropTypes.object.isRequired,
  equipmentData: PropTypes.object.isRequired,
  conveyorStatus: PropTypes.string.isRequired
};

export default EquipmentPerformance;
