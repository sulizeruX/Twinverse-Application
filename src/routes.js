

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Notifications from "layouts/notifications";
import ConveyorMonitoring from "layouts/conveyor-monitoring";
import Analytics from "layouts/analytics";
import ControlPanel from "layouts/control-panel";
import SystemDiagnostics from "layouts/system-diagnostics";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Conveyor Monitoring",
    key: "conveyor-monitoring",
    icon: <Icon fontSize="small">settings_input_component</Icon>,
    route: "/conveyor-monitoring",
    component: <ConveyorMonitoring />,
  },
  {
    type: "collapse",
    name: "Control Panel",
    key: "control-panel",
    icon: <Icon fontSize="small">toggle_on</Icon>,
    route: "/control-panel",
    component: <ControlPanel />,
  },
  {
    type: "collapse",
    name: "Personnel",
    key: "tables",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Analytics",
    key: "analytics",
    icon: <Icon fontSize="small">analytics</Icon>,
    route: "/analytics",
    component: <Analytics />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "System Diagnostics",
    key: "system-diagnostics",
    icon: <Icon fontSize="small">build</Icon>,
    route: "/system-diagnostics",
    component: <SystemDiagnostics />,
  },
];

export default routes;
