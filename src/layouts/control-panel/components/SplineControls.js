import { useState } from "react";
import { 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Switch,
  Paper,
  IconButton,
  CircularProgress,
  Chip
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";

function SplineControls({ splines, toggleSplinePause, globalPauseState, loading }) {
  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDTypography variant="h6" fontWeight="medium">
            Spline Controls
          </MDTypography>
          {loading && <CircularProgress size={24} />}
        </MDBox>
        
        {splines.length === 0 && !loading ? (
          <MDBox textAlign="center" py={2}>
            <MDTypography variant="body2" color="text">
              No splines available. Adding some default splines...
            </MDTypography>
            <CircularProgress size={24} sx={{ mt: 2 }} />
          </MDBox>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Spline ID</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                  <TableCell align="right">Controls</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {splines.map((spline) => {
                  // If global pause is active, spline is considered paused regardless of individual state
                  const effectivelyPaused = globalPauseState || spline.paused;
                  
                  return (
                    <TableRow key={spline.id}>
                      <TableCell component="th" scope="row">
                        <MDTypography variant="button" fontWeight="medium">
                          {spline.id}
                        </MDTypography>
                        {spline.id.startsWith('Spline') && (
                          <MDTypography variant="caption" color="text" display="block">
                            Conveyor {spline.id.replace('Spline', '')}
                          </MDTypography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={effectivelyPaused ? "Paused" : "Running"} 
                          color={effectivelyPaused ? "error" : "success"}
                          size="small"
                        />
                        {globalPauseState && !spline.paused && (
                          <MDTypography variant="caption" color="text" fontStyle="italic" display="block">
                            (Paused by global control)
                          </MDTypography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={!spline.paused}
                          onChange={() => toggleSplinePause(spline.id, spline.paused)}
                          color={spline.paused ? "error" : "success"}
                          disabled={loading || globalPauseState}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color={spline.paused ? "success" : "error"}
                          onClick={() => toggleSplinePause(spline.id, spline.paused)}
                          disabled={loading || globalPauseState}
                          size="small"
                        >
                          <Icon>{spline.paused ? "play_arrow" : "pause"}</Icon>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MDBox>
    </Card>
  );
}

export default SplineControls;
