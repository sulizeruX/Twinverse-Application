import { Card, FormControlLabel, Switch, Box, CircularProgress } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";

function GlobalControls({ globalPauseState, toggleGlobalPause, loading }) {
  return (
    <Card>
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6" fontWeight="medium">
            Global Control
          </MDTypography>
          {loading && <CircularProgress size={24} />}
        </MDBox>
        <MDBox pt={3} pb={1}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={globalPauseState}
                  onChange={toggleGlobalPause}
                  color={globalPauseState ? "error" : "success"}
                  disabled={loading}
                />
              }
              label={
                <MDTypography variant="button" fontWeight="regular" color="text">
                  {globalPauseState ? "Global Pause Active" : "Global Pause Inactive"}
                </MDTypography>
              }
            />
          </MDBox>
          <MDBox mt={2}>
            <MDButton
              variant="contained"
              color={globalPauseState ? "success" : "error"}
              onClick={toggleGlobalPause}
              disabled={loading}
              fullWidth
            >
              <Icon>{globalPauseState ? "play_arrow" : "pause"}</Icon>&nbsp;
              {globalPauseState ? "Resume All Conveyors" : "Pause All Conveyors"}
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default GlobalControls;
