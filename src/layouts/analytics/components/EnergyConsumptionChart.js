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

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function EnergyConsumptionChart() {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "energy-consumption",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ["#FF9800", "#4CAF50"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      grid: {
        borderColor: "#e7e7e7",
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
      },
      markers: {
        size: 0,
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        title: {
          text: "Month",
        },
      },
      yaxis: [
        {
          title: {
            text: "Energy Consumption (kWh)",
          },
        },
        {
          opposite: true,
          title: {
            text: "Efficiency (%)",
          },
          min: 0,
          max: 100
        }
      ],
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function (val, { seriesIndex }) {
            if (seriesIndex === 0) return val + " kWh";
            return val + "%";
          },
        },
      },
    },
    series: [
      {
        name: "Energy Consumption",
        type: "column",
        data: [45000, 42000, 47500, 49200, 52300, 57100, 59800, 61500, 58200, 54300, 51000, 48500],
      },
      {
        name: "Energy Efficiency",
        type: "line",
        data: [68.5, 69.2, 71.5, 73.8, 75.2, 78.5, 80.2, 82.5, 83.1, 82.8, 81.5, 80.7],
      },
    ],
  });

  // Simulate fetching real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Here you would typically fetch data from your API
      // For now, we'll just simulate data changes
      
      const newConsumption = chartData.series[0].data.map(value => {
        const randomChange = Math.floor(Math.random() * 2000) - 1000; // -1000 to +1000
        return Math.max(value + randomChange, 40000); // Ensure it doesn't go below 40000
      });
      
      const newEfficiency = chartData.series[1].data.map(value => {
        const randomChange = (Math.random() * 2 - 1).toFixed(1); // -1.0 to +1.0
        return Math.min(Math.max(parseFloat(value) + parseFloat(randomChange), 65), 90); // Keep between 65 and 90
      });
      
      setChartData(prevState => ({
        ...prevState,
        series: [
          { ...prevState.series[0], data: newConsumption },
          { ...prevState.series[1], data: newEfficiency }
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
        type="line"
        height={350}
      />
    </MDBox>
  );
}

export default EnergyConsumptionChart;
