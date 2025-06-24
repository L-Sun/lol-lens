import { Outlet } from "react-router";

import { SideNav } from "@/components/sidenav";
import { useLcuInfo } from "@/hooks";
import { LcuInfoContext } from "@/lcu/context";
import { navInfos } from "@/router";

function App() {
  const lcuInfo = useLcuInfo();

  return (
    <LcuInfoContext.Provider value={lcuInfo}>
      <div className="flex h-screen">
        <SideNav routerInfos={navInfos} />
        <main className="flex-1 overflow-auto scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </LcuInfoContext.Provider>
  );
}

export default App;
