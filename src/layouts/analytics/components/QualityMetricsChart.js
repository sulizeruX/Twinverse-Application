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

function QualityMetricsChart() {
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "quality-metrics",
        toolbar: {
          show: false,
        },
        stacked: false,
      },
      colors: ["#F44336", "#2196F3", "#4CAF50"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [3, 3, 3],
        curve: "smooth",
      },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5,
        },
      },
      markers: {
        size: 4,
        hover: {
          size: 6,
        }
      },
      xaxis: {
        categories: ["Line 1", "Line 2", "Line 3", "Line 4", "Line 5"],
        title: {
          text: "Production Line",
        },
      },
      yaxis: [
        {
          title: {
            text: "Defect Rate (%)",
          },
          min: 0,
          max: 5,
        },
        {
          title: {
            text: "First Pass Yield (%)",
          },
          opposite: true,
          min: 90,
          max: 100,
        },
      ],
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: function (val, { seriesIndex }) {
            return val + "%";
          },
        },
      },
    },
    series: [
      {
        name: "Defect Rate",
        type: "column",
        data: [1.8, 2.4, 1.2, 3.1, 0.9],
      },
      {
        name: "First Pass Yield",
        type: "line",
        data: [97.3, 96.5, 98.2, 95.8, 98.9],
      },
      {
        name: "Target Quality",
        type: "line",
        data: [98, 98, 98, 98, 98],
      },
    ],
  });

  // Simulate fetching real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Here you would typically fetch data from your API
      // For now, we'll just simulate data changes
      
      const newDefectRate = chartData.series[0].data.map(value => {
        const randomChange = (Math.random() * 0.4 - 0.2).toFixed(1); // -0.2 to +0.2
        return Math.max(parseFloat(value) + parseFloat(randomChange), 0.5).toFixed(1); // Ensure it doesn't go below 0.5
      });
      
      const newYield = chartData.series[1].data.map((value, index) => {
        // Calculate yield as roughly the inverse of defect rate (100 - defect)
        const defect = newDefectRate[index];
        const randomFactor = (Math.random() * 0.4 - 0.2).toFixed(1);
        return (100 - defect - parseFloat(randomFactor)).toFixed(1);
      });
      
      setChartData(prevState => ({
        ...prevState,
        series: [
          { ...prevState.series[0], data: newDefectRate },
          { ...prevState.series[1], data: newYield },
          prevState.series[2], // Keep the target line unchanged
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

export default QualityMetricsChart;
