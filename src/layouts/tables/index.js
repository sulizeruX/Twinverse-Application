

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Data
import personnelTableData from "layouts/tables/data/personnelTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";

// Custom hooks
import useDashboardDataCollector from "hooks/useDashboardDataCollector";

function Tables() {
  const { columns, rows } = personnelTableData();
  const { columns: pColumns, rows: pRows } = projectsTableData();
  
  // Prepare table data for the ChatWidget
  const tablesData = {
    personnelTable: {
      columns: columns.map(col => col.Header),
      data: rows.map(row => {
        // Convert row objects to simpler format for AI processing
        const rowData = {};
        columns.forEach(col => {
          const accessor = col.accessor;
          // Handle complex components by extracting text where possible
          if (row[accessor] && typeof row[accessor] === 'object') {
            if (row[accessor].props && row[accessor].props.children) {
              rowData[col.Header] = 'Component data';
            } else {
              rowData[col.Header] = 'Complex data';
            }
          } else {
            rowData[col.Header] = row[accessor];
          }
        });
        return rowData;
      })
    },
    projectsTable: {
      columns: pColumns.map(col => col.Header),
      projectStatus: pRows.map(row => {
        // Extract project status information
        let projectName = 'Unknown';
        let completion = 0;
        let status = 'unknown';
        
        // Try to extract project name
        if (row.project && row.project.props && row.project.props.name) {
          projectName = row.project.props.name;
        }
        
        // Try to extract completion percentage
        if (row.completion && row.completion.props && row.completion.props.value) {
          completion = row.completion.props.value;
        }
        
        // Try to extract status
        if (row.status && row.status.props && row.status.props.children) {
          status = row.status.props.children;
        }
        
        return {
          projectName,
          completion,
          status
        };
      })
    }
  };
  
  // Share table data with the ChatWidget
  useDashboardDataCollector(tablesData, 'tables');

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                  Personnel Information
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
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
                  Industrial Simulation Projects
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: pColumns, rows: pRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
