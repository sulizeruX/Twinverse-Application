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

function ProductionTrendChart() {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "production-trend",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ["#4CAF50", "#2196F3", "#FF9800"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5,
        },
      },
      markers: {
        size: 3,
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        title: {
          text: "Month",
        },
      },
      yaxis: {
        title: {
          text: "Units Produced",
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function (val) {
            return val + " units";
          },
        },
      },
    },
    series: [
      {
        name: "Line A",
        data: [8500, 8200, 8700, 9100, 9400, 9800, 10100, 10400, 10800, 11200, 11500, 11900],
      },
      {
        name: "Line B",
        data: [7800, 7500, 7900, 8200, 8500, 8700, 8900, 9200, 9500, 9700, 10000, 10300],
      },
      {
        name: "Line C",
        data: [5100, 5400, 5700, 6000, 6300, 6500, 6800, 7100, 7300, 7500, 7800, 8100],
      },
    ],
  });

  // Simulate fetching real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Here you would typically fetch data from your API
      // For now, we'll just simulate data changes
      
      const newData = chartData.series.map(series => {
        // Add some random variations to the last value
        const lastVal = series.data[series.data.length - 1];
        const randomChange = Math.floor(Math.random() * 200) - 100; // -100 to +100
        const newVal = Math.max(lastVal + randomChange, 5000); // Ensure it doesn't go below 5000
        
        // Shift all values one place to the left and add the new value at the end
        const newValues = [...series.data.slice(1), newVal];
        
        return {
          ...series,
          data: newValues,
        };
      });
      
      setChartData(prevState => ({
        ...prevState,
        series: newData,
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

export default ProductionTrendChart;
