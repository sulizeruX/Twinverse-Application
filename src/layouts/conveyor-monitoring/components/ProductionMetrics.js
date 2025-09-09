import PropTypes from "prop-types";
import { Card, Grid, LinearProgress } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ProductionMetrics({ data, conveyorStatus }) {
  // Helper function to determine color based on value
  const getColorForPercentage = (value, isHigherBetter = true) => {
    if (conveyorStatus === "non-operational") return "dark";
    
    if (isHigherBetter) {
      return value < 70 ? "error" : value < 85 ? "warning" : "success";
    } else {
      return value > 10 ? "error" : value > 5 ? "warning" : "success";
    }
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Production Metrics
        </MDTypography>
        
        <MDBox mt={3}>
          <Grid container spacing={2}>
            {/* Quality Section */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="medium">
                Quality
              </MDTypography>
              <MDBox mt={1}>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="button" color="text">First Pass Yield</MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {data.quality.first_pass_yield}%
                  </MDTypography>
                </MDBox>
                <LinearProgress 
                  variant="determinate" 
                  value={data.quality.first_pass_yield} 
                  color={getColorForPercentage(data.quality.first_pass_yield)}
                />
              </MDBox>
              
              <MDBox mt={2}>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="button" color="text">Defect Rate</MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {data.quality.defect_rate}%
                  </MDTypography>
                </MDBox>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(data.quality.defect_rate * 5, 100)} 
                  color={getColorForPercentage(data.quality.defect_rate, false)}
                />
              </MDBox>
              
              <MDBox mt={2}>
                <MDBox display="flex" justifyContent="space-between" mb={0.5}>
                  <MDTypography variant="button" color="text">Scrap Rate</MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {data.quality.scrap_rate}%
                  </MDTypography>
                </MDBox>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(data.quality.scrap_rate * 5, 100)} 
                  color={getColorForPercentage(data.quality.scrap_rate, false)}
                />
              </MDBox>
            </Grid>
            
            {/* Time Per Hour Section */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="medium" mt={2}>
                Time Per Hour
              </MDTypography>
              <Grid container spacing={3} mt={0}>
                <Grid item xs={4}>
                  <MDBox textAlign="center" p={1}>
                    <MDTypography variant="h4" fontWeight="medium">
                      {data.time_per_hour.units_produced}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Units/Hour
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={4}>
                  <MDBox textAlign="center" p={1}>
                    <MDTypography variant="h4" fontWeight="medium">
                      {data.time_per_hour.cycle_time}s
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Cycle Time
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={4}>
                  <MDBox textAlign="center" p={1}>
                    <MDTypography 
                      variant="h4" 
                      fontWeight="medium"
                      color={getColorForPercentage(data.time_per_hour.efficiency)}
                    >
                      {data.time_per_hour.efficiency}%
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Efficiency
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Product Management Section */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="medium" mt={2}>
                Product Management
              </MDTypography>
              <Grid container spacing={2} mt={0}>
                <Grid item xs={6} md={3}>
                  <MDBox p={1}>
                    <MDTypography variant="button" color="text" display="block">
                      Active Orders
                    </MDTypography>
                    <MDTypography variant="h6">
                      {data.product_management.active_orders}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={6} md={3}>
                  <MDBox p={1}>
                    <MDTypography variant="button" color="text" display="block">
                      Backlog
                    </MDTypography>
                    <MDTypography 
                      variant="h6" 
                      color={data.product_management.backlog > 10 ? "error" : "dark"}
                    >
                      {data.product_management.backlog}
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={6} md={3}>
                  <MDBox p={1}>
                    <MDTypography variant="button" color="text" display="block">
                      On-Time Delivery
                    </MDTypography>
                    <MDTypography 
                      variant="h6"
                      color={getColorForPercentage(data.product_management.on_time_delivery)}
                    >
                      {data.product_management.on_time_delivery}%
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={6} md={3}>
                  <MDBox p={1}>
                    <MDTypography variant="button" color="text" display="block">
                      Inventory Levels
                    </MDTypography>
                    <MDTypography variant="h6">
                      {data.product_management.inventory_levels}%
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Production Rate Section */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle2" fontWeight="medium" mt={2}>
                Production Rate
              </MDTypography>
              <Grid container spacing={2} alignItems="center" mt={0}>
                <Grid item xs={12} md={4}>
                  <MDBox p={1}>
                    <MDTypography variant="button" color="text" display="block">
                      Current Rate
                    </MDTypography>
                    <MDTypography variant="h6">
                      {data.production_rate.current_rate} units/hr
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDBox p={1}>
                    <MDTypography variant="button" color="text" display="block">
                      Target Rate
                    </MDTypography>
                    <MDTypography variant="h6">
                      {data.production_rate.target_rate} units/hr
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDBox p={1}>
                    <MDTypography variant="button" color="text" display="block">
                      Variance
                    </MDTypography>
                    <MDTypography 
                      variant="h6"
                      color={data.production_rate.variance < -10 ? "error" : data.production_rate.variance > 5 ? "success" : "dark"}
                    >
                      {data.production_rate.variance > 0 ? "+" : ""}{data.production_rate.variance}%
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </Card>
  );
}

// PropTypes
ProductionMetrics.propTypes = {
  data: PropTypes.object.isRequired,
  conveyorStatus: PropTypes.string.isRequired
};

export default ProductionMetrics;
