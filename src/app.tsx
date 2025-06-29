import { Outlet } from "react-router";

import { SideNav } from "@/components/sidenav";
import { LcuProvider } from "@/lcu/provider";
import { navInfos } from "@/router";

function App() {
  return (
    <LcuProvider>
      <div className="flex h-screen">
        <SideNav routerInfos={navInfos} />
        <main className="p-6 flex-1 overflow-auto scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </LcuProvider>
  );
}

export default App;
