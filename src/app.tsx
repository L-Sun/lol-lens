import { Outlet } from "react-router";

import { SideNav } from "./components/sidenav";
import { routerInfos } from "./router";

function App() {
  return (
    <div className="flex h-screen">
      <SideNav routerInfos={routerInfos} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
