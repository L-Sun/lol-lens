import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";
import { useRequest, useUnmount } from "ahooks";
import { useEffect, useRef } from "react";

import { LcuInfoSchema } from "./lcu/types";
import { LcuWebSocket } from "./lcu/ws";

export function useLOLRunningState() {
  const { data } = useRequest(
    async () => await invoke<boolean>("lol_running_state"),
    {
      pollingInterval: 1000,
    }
  );

  return !!data;
}

export function useLcuInfo() {
  const lolRunning = useLOLRunningState();

  const { data } = useRequest(
    async () => {
      if (!lolRunning) return;

      return LcuInfoSchema.parse(await invoke("get_lcu_port_token"));
    },
    {
      refreshDeps: [lolRunning],
    }
  );

  return data;
}

export function useLcuApi(endpoint: string) {
  const info = useLcuInfo();

  return useRequest(async () => {
    if (!info) return;
    const response = await fetch(`http://127.0.0.1:${info.port}/${endpoint}`, {
      headers: {
        Authorization: `Basic ${info.token}`,
      },
    });
    return response.json() as Promise<unknown>;
  });
}

function useLcuWebSocket() {
  const info = useLcuInfo();
  const websocketRef = useRef<LcuWebSocket>();

  useEffect(() => {
    websocketRef.current?.close();
    websocketRef.current = undefined;
    if (info) {
      LcuWebSocket.connect(info)
        .then((ws) => {
          websocketRef.current = ws;
        })
        .catch(console.error);
    }
  }, [info]);

  useUnmount(() => {
    websocketRef.current?.close();
  });

  return websocketRef.current;
}

export function useLcuEvent(event: string, callback: (data: unknown) => void) {
  const websocket = useLcuWebSocket();

  useEffect(() => {
    if (!websocket) return;

    return websocket.subscribe(event, callback);
  }, [websocket, event, callback]);
}
