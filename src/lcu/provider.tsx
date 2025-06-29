import { invoke } from "@tauri-apps/api/core";
import { useInterval, useRequest, useUnmount } from "ahooks";
import { createContext, useContext, useState } from "react";

import { fetch } from "@/lcu/fetch";
import { LcuWebSocket } from "@/lcu/ws";

import { LcuPortToken, LcuPortTokenSchema } from "./types";

export type LcuInfo =
  | ({
      running: true;
    } & LcuPortToken)
  | {
      running: false;
    };

export const LcuInfoContext = createContext<LcuInfo>({
  running: false,
});

export const LcuWebSocketContext = createContext<LcuWebSocket | undefined>(
  undefined
);

const LcuInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [info, setInfo] = useState<LcuInfo>({ running: false });
  const [checking, setChecking] = useState(false);

  useInterval(
    () => {
      if (checking) return;
      setChecking(true);

      (async () => {
        const running = await invoke<boolean>("is_lol_running");
        if (running === info.running) return;

        if (running) {
          const portToken = LcuPortTokenSchema.parse(
            await invoke("get_lcu_port_token")
          );
          // test if the port is valid
          fetch("/lol-summoner/v1/status", portToken)
            .then(() => {
              setInfo({ running, ...portToken });
            })
            .catch(() => {
              setInfo({ running: false });
            });
        } else {
          setInfo({ running: false });
        }
      })()
        .catch(console.error)
        .finally(() => {
          setChecking(false);
        });
    },
    1000,
    { immediate: true }
  );

  return (
    <LcuInfoContext.Provider value={info}>{children}</LcuInfoContext.Provider>
  );
};

const LcuWebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const info = useContext(LcuInfoContext);

  const { data: websocket } = useRequest(
    async () => {
      if (!info.running) throw new Error("LCU is not running");
      return LcuWebSocket.connect(info);
    },
    {
      refreshDeps: [info],
      ready: !!info.running,
    }
  );

  useUnmount(() => {
    websocket?.close();
  });

  return (
    <LcuWebSocketContext.Provider value={websocket}>
      {children}
    </LcuWebSocketContext.Provider>
  );
};

export const LcuProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LcuInfoProvider>
      <LcuWebSocketProvider>{children}</LcuWebSocketProvider>
    </LcuInfoProvider>
  );
};
