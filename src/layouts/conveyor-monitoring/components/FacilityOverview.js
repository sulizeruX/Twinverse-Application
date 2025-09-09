import PropTypes from "prop-types";
import { Card, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function FacilityOverview({ data, conveyorStatus }) {
  // Helper function to get appropriate color for values based on ranges
  const getValueColor = (value, category) => {
    if (conveyorStatus === "non-operational") return "dark";
    
    switch(category) {
      case "temperature":
        return value > 35 ? "error" : value > 28 ? "warning" : "success";
      case "humidity":
        return value > 80 ? "error" : value > 70 ? "warning" : "success";
      case "air_quality":
        return value < 70 ? "error" : value < 85 ? "warning" : "success";
      case "warnings":
        return value > 7 ? "error" : value > 3 ? "warning" : "success";
      default:
        return "info";
    }
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6" fontWeight="medium">
            Facility Overview
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color={getValueColor(data.temperature, "temperature")}
              icon="thermostat"
              title="Temperature"
              count={`${data.temperature}°C`}
              percentage={{
                color: data.temperature > 30 ? "error" : "success",
                amount: "",
                label: data.temperature > 30 ? "High temperature" : "Normal",
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color={getValueColor(data.humidity, "humidity")}
              icon="water_drop"
              title="Humidity"
              count={`${data.humidity}%`}
              percentage={{
                color: data.humidity > 70 ? "error" : "success",
                amount: "",
                label: data.humidity > 70 ? "High humidity" : "Normal",
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color={getValueColor(data.air_quality, "air_quality")}
              icon="air"
              title="Air Quality"
              count={`${data.air_quality}%`}
              percentage={{
                color: data.air_quality < 80 ? "error" : "success",
                amount: "",
                label: data.air_quality < 80 ? "Poor quality" : "Good quality",
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color={getValueColor(data.warnings_notifications, "warnings")}
              icon="warning"
              title="Warnings"
              count={data.warnings_notifications}
              percentage={{
                color: data.warnings_notifications > 0 ? "error" : "success",
                amount: "",
                label: "Active warnings",
              }}
            />
          </Grid>
        </Grid>

        <MDBox mt={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Personnel Data
                  </MDTypography>
                  <MDBox display="flex" justifyContent="space-between" mb={1}>
                    <MDTypography variant="button" color="text">Personnel Present:</MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {data.personal_data.personnel_present}
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" mb={1}>
                    <MDTypography variant="button" color="text">Shift Efficiency:</MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {data.personal_data.shift_efficiency}%
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="button" color="text">Safety Incidents:</MDTypography>
                    <MDTypography variant="button" fontWeight="medium" color={data.personal_data.safety_incidents > 0 ? "error" : "success"}>
                      {data.personal_data.safety_incidents}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    Power Usage
                  </MDTypography>
                  <MDBox display="flex" justifyContent="space-between" mb={1}>
                    <MDTypography variant="button" color="text">Current Power:</MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {data.power_usage.current_kw} kW
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" mb={1}>
                    <MDTypography variant="button" color="text">Daily Usage:</MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {data.power_usage.daily_usage} kWh
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="button" color="text">Efficiency Rating:</MDTypography>
                    <MDTypography 
                      variant="button" 
                      fontWeight="medium"
                      color={data.power_usage.efficiency_rating < 70 ? "error" : "success"}
                    >
                      {data.power_usage.efficiency_rating}%
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>
                    CO2 Emissions
                  </MDTypography>
                  <MDBox display="flex" justifyContent="space-between" mb={1}>
                    <MDTypography variant="button" color="text">Current Level:</MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {data.co2_emissions.current_level} ppm
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" mb={1}>
                    <MDTypography variant="button" color="text">Daily Average:</MDTypography>
                    <MDTypography variant="button" fontWeight="medium">
                      {data.co2_emissions.daily_average} ppm
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="button" color="text">Target Compliance:</MDTypography>
                    <MDTypography 
                      variant="button" 
                      fontWeight="medium"
                      color={data.co2_emissions.target_compliance < 75 ? "error" : "success"}
                    >
                      {data.co2_emissions.target_compliance}%
                    </MDTypography>
                  </MDBox>
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
FacilityOverview.propTypes = {
  data: PropTypes.object.isRequired,
  conveyorStatus: PropTypes.string.isRequired,
};

export default FacilityOverview;
