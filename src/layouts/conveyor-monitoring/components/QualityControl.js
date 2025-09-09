import PropTypes from "prop-types";
import { Card, Grid, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function QualityControl({ data, conveyorStatus }) {
  // Helper function to determine color based on quality metrics
  const getQualityColor = (value, category, isHigherBetter = true) => {
    if (conveyorStatus === "non-operational") return "dark";
    
    if (isHigherBetter) {
      return value < 80 ? "error" : value < 90 ? "warning" : "success";
    } else {
      return value > 5 ? "error" : value > 2 ? "warning" : "success";
    }
  };

  // Get trend icon and color
  const getTrendInfo = (trend) => {
    switch (trend) {
      case "improving":
        return { icon: "trending_up", color: "success" };
      case "worsening":
        return { icon: "trending_down", color: "error" };
      case "stable":
        return { icon: "trending_flat", color: "info" };
      default:
        return { icon: "help", color: "dark" };
    }
  };

  const trendInfo = getTrendInfo(data.defects_rates.trend);

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Quality Control
        </MDTypography>
        
        <MDBox mt={3}>
          <Grid container spacing={3}>
            {/* Defective Products Section */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={2}>
                  <MDTypography variant="subtitle2" fontWeight="medium">
                    Defective Products
                  </MDTypography>
                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={4}>
                      <MDBox textAlign="center">
                        <MDTypography variant="h5" fontWeight="medium">
                          {data.defective_products.count}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Count
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={4}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={getQualityColor(data.defective_products.percentage, "percentage", false)}
                        >
                          {data.defective_products.percentage}%
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Percentage
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={4}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={data.defective_products.critical_defects > 5 ? "error" : "dark"}
                        >
                          {data.defective_products.critical_defects}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Critical
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
            
            {/* Areas of Improvement */}
            <Grid item xs={12} md={6}>
              <Card>
                <MDBox p={2}>
                  <MDTypography variant="subtitle2" fontWeight="medium">
                    Areas of Improvement
                  </MDTypography>
                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={4}>
                      <MDBox textAlign="center">
                        <MDTypography variant="h5" fontWeight="medium">
                          {data.areas_of_improvement.identified_areas}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Areas
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={4}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={
                            data.areas_of_improvement.priority_level === "high" ? "error" :
                            data.areas_of_improvement.priority_level === "medium" ? "warning" : "info"
                          }
                        >
                          {data.areas_of_improvement.priority_level === "none" ? "--" : data.areas_of_improvement.priority_level}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Priority
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={4}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={
                            data.areas_of_improvement.estimated_impact > 7 ? "error" : 
                            data.areas_of_improvement.estimated_impact > 4 ? "warning" : "info"
                          }
                        >
                          {data.areas_of_improvement.estimated_impact}
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Impact (1-10)
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
            
            {/* Defect Rates */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={2}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="subtitle2" fontWeight="medium">
                      Defect Rates by Category
                    </MDTypography>
                    <MDBox display="flex" alignItems="center">
                      <Icon fontSize="small" color={trendInfo.color}>
                        {trendInfo.icon}
                      </Icon>
                      <MDTypography variant="button" fontWeight="medium" color={trendInfo.color} ml={0.5}>
                        {data.defects_rates.trend}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="medium">
                            Category
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography variant="caption" fontWeight="medium">
                            Rate
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="button">Assembly</MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            color={getQualityColor(data.defects_rates.by_category.assembly, "assembly", false)}
                          >
                            {data.defects_rates.by_category.assembly}%
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="button">Material</MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            color={getQualityColor(data.defects_rates.by_category.material, "material", false)}
                          >
                            {data.defects_rates.by_category.material}%
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="button">Finish</MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            color={getQualityColor(data.defects_rates.by_category.finish, "finish", false)}
                          >
                            {data.defects_rates.by_category.finish}%
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <MDTypography variant="button">Packaging</MDTypography>
                        </TableCell>
                        <TableCell align="right">
                          <MDTypography
                            variant="button"
                            fontWeight="medium"
                            color={getQualityColor(data.defects_rates.by_category.packaging, "packaging", false)}
                          >
                            {data.defects_rates.by_category.packaging}%
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <MDBox mt={1} display="flex" justifyContent="flex-end">
                    <MDTypography 
                      variant="button" 
                      fontWeight="medium"
                      color={data.defects_rates.within_targets ? "success" : "error"}
                    >
                      {data.defects_rates.within_targets ? "Within Targets" : "Outside Targets"}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
            
            {/* Quality Metrics */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={2}>
                  <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                    Quality Metrics
                  </MDTypography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={getQualityColor(data.quality_metrics.dimensional_accuracy, "accuracy")}
                        >
                          {data.quality_metrics.dimensional_accuracy}%
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Dimensional Accuracy
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={getQualityColor(data.quality_metrics.visual_inspection_pass_rate, "visual")}
                        >
                          {data.quality_metrics.visual_inspection_pass_rate}%
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Visual Inspection Pass Rate
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDBox textAlign="center">
                        <MDTypography 
                          variant="h5" 
                          fontWeight="medium"
                          color={getQualityColor(data.quality_metrics.customer_return_rate, "return", false)}
                        >
                          {data.quality_metrics.customer_return_rate}%
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                          Customer Return Rate
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
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
QualityControl.propTypes = {
  data: PropTypes.object.isRequired,
  conveyorStatus: PropTypes.string.isRequired
};

export default QualityControl;
