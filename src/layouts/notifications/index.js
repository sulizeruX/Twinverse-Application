/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";

// Material Dashboard 2 React contexts
import { useNotification } from "../../context/notification-context";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// WhatsApp Notifications Components
import WhatsAppNotificationsSection from "./components/WhatsAppNotificationsSection";
import AutoWhatsAppNotifications from "./components/AutoWhatsAppNotifications";

function Notifications() {
  const { 
    notifications, 
    acknowledgeNotification, 
    clearNotification, 
    getNotificationCounts,
    addSplineStoppedNotification,
    addSplinePerformanceWarning,
    addStockWarning,
    addMaintenanceNotification 
  } = useNotification();
  
  const [filter, setFilter] = useState('all'); // 'all', 'critical', 'warning', 'non-critical'

  // Add some demo notifications if none exist
  useEffect(() => {
    if (notifications.length === 0) {
      // Add some sample notifications for demonstration
      setTimeout(() => {
        addStockWarning(8, 'Raw Material A');
        addSplinePerformanceWarning('Spline1', 75);
        addMaintenanceNotification('Spline4', 2);
      }, 1000);
    }
  }, [notifications.length, addStockWarning, addSplinePerformanceWarning, addMaintenanceNotification]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'non-critical': return 'info';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'non-critical': return 'info';
      default: return 'notifications';
    }
  };

  const getTypePriority = (type) => {
    switch (type) {
      case 'critical': return 3;
      case 'warning': return 2;
      case 'non-critical': return 1;
      default: return 0;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filteredNotifications = notifications
    .filter(notif => filter === 'all' || notif.type === filter)
    .sort((a, b) => {
      // Sort by: not acknowledged first, then by priority, then by timestamp
      if (a.acknowledged !== b.acknowledged) {
        return a.acknowledged ? 1 : -1;
      }
      if (getTypePriority(a.type) !== getTypePriority(b.type)) {
        return getTypePriority(b.type) - getTypePriority(a.type);
      }
      return b.timestamp - a.timestamp;
    });

  const counts = getNotificationCounts();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={6} mb={3}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} lg={12}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="h6" color="text">
                      Total Alerts
                    </MDTypography>
                    <MDTypography variant="h4" color="dark" fontWeight="bold">
                      {counts.all}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ backgroundColor: 'error.main', color: 'white' }}>
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="h6" color="white">
                      Critical
                    </MDTypography>
                    <MDTypography variant="h4" color="white" fontWeight="bold">
                      {counts.critical}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ backgroundColor: 'warning.main', color: 'white' }}>
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="h6" color="white">
                      Warnings
                    </MDTypography>
                    <MDTypography variant="h4" color="white" fontWeight="bold">
                      {counts.warning}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ backgroundColor: 'info.main', color: 'white' }}>
                  <MDBox p={2} textAlign="center">
                    <MDTypography variant="h6" color="white">
                      Non-Critical
                    </MDTypography>
                    <MDTypography variant="h4" color="white" fontWeight="bold">
                      {counts['non-critical']}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Filter Buttons */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h5" mb={2}>System Notifications</MDTypography>
                <MDBox display="flex" gap={1} flexWrap="wrap">
                  <MDButton
                    variant={filter === 'all' ? 'gradient' : 'outlined'}
                    color="dark"
                    size="small"
                    onClick={() => setFilter('all')}
                  >
                    All ({counts.all})
                  </MDButton>
                  <MDButton
                    variant={filter === 'critical' ? 'gradient' : 'outlined'}
                    color="error"
                    size="small"
                    onClick={() => setFilter('critical')}
                  >
                    Critical ({counts.critical})
                  </MDButton>
                  <MDButton
                    variant={filter === 'warning' ? 'gradient' : 'outlined'}
                    color="warning"
                    size="small"
                    onClick={() => setFilter('warning')}
                  >
                    Warnings ({counts.warning})
                  </MDButton>
                  <MDButton
                    variant={filter === 'non-critical' ? 'gradient' : 'outlined'}
                    color="info"
                    size="small"
                    onClick={() => setFilter('non-critical')}
                  >
                    Non-Critical ({counts['non-critical']})
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Notifications Table */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Spline</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredNotifications.map((notification) => (
                        <TableRow
                          key={notification.id}
                          sx={{
                            backgroundColor: notification.acknowledged ? 'transparent' : 'action.hover',
                            opacity: notification.acknowledged ? 0.7 : 1,
                          }}
                        >
                          <TableCell>
                            <Chip
                              icon={<Icon>{getTypeIcon(notification.type)}</Icon>}
                              label={notification.type.toUpperCase()}
                              color={getTypeColor(notification.type)}
                              size="small"
                              variant={notification.acknowledged ? 'outlined' : 'filled'}
                            />
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="button" fontWeight="medium">
                              {notification.title}
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="caption" color="text">
                              {notification.message}
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="caption" color="text">
                              {notification.source}
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            {notification.splineId ? (
                              <Chip
                                label={notification.splineId}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ) : (
                              <MDTypography variant="caption" color="text">
                                System
                              </MDTypography>
                            )}
                          </TableCell>
                          <TableCell>
                            <MDTypography variant="caption" color="text">
                              {formatTimestamp(notification.timestamp)}
                            </MDTypography>
                          </TableCell>
                          <TableCell>
                            {notification.acknowledged ? (
                              <Chip
                                label="Acknowledged"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                label="Unread"
                                size="small"
                                color="warning"
                                variant="filled"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <MDBox display="flex" gap={1}>
                              {!notification.acknowledged && (
                                <MDButton
                                  variant="text"
                                  color="success"
                                  size="small"
                                  onClick={() => acknowledgeNotification(notification.id)}
                                >
                                  <Icon sx={{ mr: 0.5 }}>check</Icon>
                                  Ack
                                </MDButton>
                              )}
                              <MDButton
                                variant="text"
                                color="error"
                                size="small"
                                onClick={() => clearNotification(notification.id)}
                              >
                                <Icon sx={{ mr: 0.5 }}>close</Icon>
                                Clear
                              </MDButton>
                            </MDBox>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {filteredNotifications.length === 0 && (
                  <MDBox textAlign="center" py={3}>
                    <MDTypography variant="body2" color="text">
                      No notifications found for the selected filter.
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Auto WhatsApp Notifications */}
          <Grid item xs={12}>
            <AutoWhatsAppNotifications />
          </Grid>
          
          {/* WhatsApp Notifications Section */}
          <Grid item xs={12}>
            <WhatsAppNotificationsSection />
          </Grid>

          {/* Legend */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={2}>
                <MDTypography variant="h6" mb={2}>Notification Types</MDTypography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <MDAlert color="error" dismissible={false}>
                      <MDTypography variant="body2" color="white" fontWeight="medium">
                        Critical: Stock running out, complete spline failure, safety issues
                      </MDTypography>
                    </MDAlert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDAlert color="warning" dismissible={false}>
                      <MDTypography variant="body2" color="white" fontWeight="medium">
                        Warning: Manual stops, performance issues, malfunctions
                      </MDTypography>
                    </MDAlert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <MDAlert color="info" dismissible={false}>
                      <MDTypography variant="body2" color="white" fontWeight="medium">
                        Non-Critical: Maintenance due, production updates, informational
                      </MDTypography>
                    </MDAlert>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Notifications;
