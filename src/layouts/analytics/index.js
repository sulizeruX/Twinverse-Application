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
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Divider } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Analytics components
import ProductionMetrics from "layouts/analytics/components/ProductionMetrics";
import QualityKPIs from "layouts/analytics/components/QualityKPIs";
import EfficiencyRates from "layouts/analytics/components/EfficiencyRates";
import MaintenanceTrends from "layouts/analytics/components/MaintenanceTrends";
import EnergyConsumption from "layouts/analytics/components/EnergyConsumption";
import ProductionTrendChart from "layouts/analytics/components/ProductionTrendChart";
import EnergyConsumptionChart from "layouts/analytics/components/EnergyConsumptionChart";
import QualityMetricsChart from "layouts/analytics/components/QualityMetricsChart";
import MaintenancePerformanceChart from "layouts/analytics/components/MaintenancePerformanceChart";

function Analytics() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <MDBox mb={1.5}>
                    <ProductionMetrics 
                      color="info"
                      icon="speed"
                      title="Total Production"
                      count="8,750"
                      percentage={{ color: "success", amount: "+5%", label: "vs last month" }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <MDBox mb={1.5}>
                    <QualityKPIs 
                      color="success"
                      icon="check_circle"
                      title="Quality Rate"
                      count="97.3%"
                      percentage={{ color: "success", amount: "+0.8%", label: "vs last month" }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <MDBox mb={1.5}>
                    <EfficiencyRates 
                      color="warning"
                      icon="trending_up"
                      title="OEE"
                      count="82.5%"
                      percentage={{ color: "success", amount: "+3.2%", label: "vs last month" }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <MDBox mb={1.5}>
                    <MaintenanceTrends 
                      color="primary"
                      icon="build"
                      title="MTBF"
                      count="168h"
                      percentage={{ color: "success", amount: "+12.5%", label: "vs last month" }}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Grid>

          {/* Production Metrics Chart */}
          <Grid item xs={12} lg={7}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Production Metrics
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <MDBox height="400px">
                  <ProductionTrendChart />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Energy Consumption Chart */}
          <Grid item xs={12} lg={5}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="success"
                borderRadius="lg"
                coloredShadow="success"
              >
                <MDTypography variant="h6" color="white">
                  Energy Consumption Trends
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <MDBox height="400px">
                  <EnergyConsumptionChart />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Quality Metrics Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  Quality Metrics by Line
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <MDBox height="400px">
                  <QualityMetricsChart />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Maintenance Performance */}
          <Grid item xs={12} lg={4}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="primary"
                borderRadius="lg"
                coloredShadow="primary"
              >
                <MDTypography variant="h6" color="white">
                  Maintenance KPIs
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <MDBox height="400px">
                  <MaintenancePerformanceChart />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Analytics;
