import PropTypes from "prop-types";
import { Card, Grid, Divider } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import { Chip } from "@mui/material";

function ConveyorOverview({ conveyorId, status, productionRate, temperature, quality, uptime, onClick }) {
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
    <Card sx={{ cursor: "pointer" }} onClick={onClick}>
      <MDBox p={2}>
        <MDBox display="flex" alignItems="center" justifyContent="space-between">
          <MDTypography variant="h6" fontWeight="medium">
            Conveyor {conveyorId}
          </MDTypography>
          <Chip
            icon={<Icon>{statusIcon}</Icon>}
            label={statusText}
            color={statusColor}
            size="small"
          />
        </MDBox>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <MDBox display="flex" alignItems="center">
              <Icon color="info" fontSize="small" sx={{ mr: 1 }}>speed</Icon>
              <MDTypography variant="caption" fontWeight="medium">
                Production: {productionRate} units/h
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={6}>
            <MDBox display="flex" alignItems="center">
              <Icon color="error" fontSize="small" sx={{ mr: 1 }}>thermostat</Icon>
              <MDTypography variant="caption" fontWeight="medium">
                Temp: {temperature}°C
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={6}>
            <MDBox display="flex" alignItems="center">
              <Icon color="success" fontSize="small" sx={{ mr: 1 }}>verified</Icon>
              <MDTypography variant="caption" fontWeight="medium">
                Quality: {quality}%
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={6}>
            <MDBox display="flex" alignItems="center">
              <Icon color="warning" fontSize="small" sx={{ mr: 1 }}>av_timer</Icon>
              <MDTypography variant="caption" fontWeight="medium">
                Uptime: {uptime}%
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        
        <MDBox mt={2} display="flex" justifyContent="flex-end">
          <MDButton variant="outlined" color={statusColor} size="small">
            Details
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// PropTypes
ConveyorOverview.propTypes = {
  conveyorId: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  productionRate: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  quality: PropTypes.number.isRequired,
  uptime: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ConveyorOverview;
