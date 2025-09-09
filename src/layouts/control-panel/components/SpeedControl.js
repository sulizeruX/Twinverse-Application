import { Card, Slider, TextField, Button, Box, Stack } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useState } from "react";
import Icon from "@mui/material/Icon";

function SpeedControl({ speed, updateSpeed }) {
  const [inputSpeed, setInputSpeed] = useState(speed);
  
  const handleSliderChange = (event, newValue) => {
    setInputSpeed(newValue);
  };
  
  const handleInputChange = (event) => {
    const newValue = event.target.value === '' ? 0 : Number(event.target.value);
    if (newValue >= 0 && newValue <= 200) {
      setInputSpeed(newValue);
    }
  };
  
  const handleBlur = () => {
    updateSpeed(inputSpeed);
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    updateSpeed(inputSpeed);
  };
  
  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Speed Control
        </MDTypography>
        
        <MDBox pt={3} pb={1}>
          <form onSubmit={handleSubmit}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <Stack spacing={2} direction="row" sx={{ mb: 1, width: '100%' }} alignItems="center">
                <Icon>speed</Icon>
                <Slider
                  value={inputSpeed}
                  min={0}
                  max={200}
                  onChange={handleSliderChange}
                  onChangeCommitted={(_, value) => updateSpeed(value)}
                  aria-labelledby="speed-slider"
                  color="info"
                />
                <TextField
                  value={inputSpeed}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  inputProps={{
                    step: 5,
                    min: 0,
                    max: 200,
                    type: 'number',
                    'aria-labelledby': 'speed-slider',
                  }}
                  size="small"
                  sx={{ width: 80 }}
                />
              </Stack>
            </MDBox>
            
            <MDBox mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="outlined"
                color="error"
                onClick={() => updateSpeed(0)}
              >
                Stop (0)
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                onClick={() => updateSpeed(50)}
              >
                Slow (50)
              </Button>
              
              <Button
                variant="outlined"
                color="info"
                onClick={() => updateSpeed(100)}
              >
                Normal (100)
              </Button>
              
              <Button
                variant="outlined"
                color="success"
                onClick={() => updateSpeed(150)}
              >
                Fast (150)
              </Button>
            </MDBox>
          </form>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default SpeedControl;
