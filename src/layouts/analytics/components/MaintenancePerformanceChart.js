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

import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

function MaintenancePerformanceChart() {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "maintenance-performance",
        type: "radar",
        toolbar: {
          show: false,
        },
      },
      colors: ["#4CAF50", "#FF9800", "#03A9F4"],
      labels: ["MTBF", "MTTR", "PM Compliance", "Availability", "Repair Cost", "Spare Parts"],
      plotOptions: {
        radar: {
          size: 140,
          polygons: {
            strokeColors: "#e9e9e9",
            fill: {
              colors: ["#f8f8f8", "#fff"],
            },
          },
        },
      },
      fill: {
        opacity: 0.5,
      },
      markers: {
        size: 5,
        hover: {
          size: 10,
        },
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function (val) {
            return val + "%";
          },
        },
      },
    },
    series: [
      {
        name: "Current Performance",
        data: [85, 75, 92, 88, 78, 82],
      },
      {
        name: "Previous Month",
        data: [80, 70, 90, 85, 80, 75],
      },
      {
        name: "Target",
        data: [90, 85, 95, 90, 85, 90],
      },
    ],
  });

  // Simulate fetching real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Here you would typically fetch data from your API
      // For now, we'll just simulate data changes
      
      const newCurrentPerformance = chartData.series[0].data.map((value, index) => {
        const randomChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newValue = Math.min(Math.max(value + randomChange, 65), 95);
        return newValue;
      });
      
      setChartData(prevState => ({
        ...prevState,
        series: [
          { ...prevState.series[0], data: newCurrentPerformance },
          prevState.series[1], // Keep previous month data unchanged
          prevState.series[2], // Keep target unchanged
        ],
      }));
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [chartData]);

  return (
    <MDBox p={2}>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="radar"
        height={350}
      />
    </MDBox>
  );
}

export default MaintenancePerformanceChart;
