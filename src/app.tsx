import { Outlet } from "react-router";

import { SideNav } from "@/components/sidenav";
import { LcuProvider } from "@/lcu/provider";
import { navInfos } from "@/router";

function App() {
  return (
    <LcuProvider>
      <div className="flex h-screen">
        <SideNav routerInfos={navInfos} />
        <main className="scrollbar-hide flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </LcuProvider>
  );
}

export default App;
