import { Box } from "@mui/material";
import { Outlet } from "react-router";

import { SideNav } from "./components/sidenav";
import { routerInfos } from "./router";

function App() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideNav routerInfos={routerInfos} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default App;
