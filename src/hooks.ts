import { invoke } from "@tauri-apps/api/core";
import { useInterval, useRequest, useUnmount } from "ahooks";
import { useEffect, useState } from "react";

import { fetch } from "./lcu/fetch";
import {
  Endpoint,
  EndpointSchema,
  endpointSchemas,
  LcuInfoSchema,
} from "./lcu/types";
import { LcuWebSocket } from "./lcu/ws";

type RequestOptions<TData> = Parameters<typeof useRequest<TData, []>>[1];

export function useLOLRunningState() {
  const [running, setRunning] = useState(false);

  useInterval(
    () => {
      invoke<boolean>("is_lol_running")
        .then((v) => {
          if (v !== running) setRunning(v);
        })
        .catch(console.error);
    },
    1000,
    { immediate: true }
  );

  return running;
}

export function useLcuInfo() {
  const lolRunning = useLOLRunningState();

  const { data } = useRequest(
    async () => {
      return LcuInfoSchema.parse(await invoke("get_lcu_port_token"));
    },
    {
      refreshDeps: [lolRunning],
      cacheKey: "lcu_info",
      ready: lolRunning,
    }
  );

  return data;
}

export function useLcuApi(
  endpoint: Endpoint,
  options?: RequestOptions<EndpointSchema<Endpoint>>
) {
  const info = useLcuInfo();

  return useRequest(
    async () => {
      if (!info) throw new Error("LCU is not running");
      const response = await fetch(endpoint, info);
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/json")) {
        return endpointSchemas[endpoint].parse(await response.json());
      }
      throw new Error(`Unsupported content type: ${contentType}`);
    },
    {
      ...options,
      refreshDeps: [info, ...(options?.refreshDeps ?? [])],
      ready: !!info && (options?.ready ?? true),
    }
  );
}

export function useLcuResource(url: string, options: RequestOptions<Blob>) {
  const info = useLcuInfo();

  return useRequest(
    async () => {
      if (!info) throw new Error("LCU is not running");
      const response = await fetch(url, info);
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("image")) {
        return response.blob();
      }
      throw new Error(`Unsupported content type: ${contentType}`);
    },
    {
      ...options,
      refreshDeps: [info, ...(options?.refreshDeps ?? [])],
      ready: !!info && (options?.ready ?? true),
      cacheKey: options?.cacheKey ?? url,
    }
  );
}

export function useLcuWebSocket() {
  const info = useLcuInfo();

  const { data: websocket } = useRequest(
    async () => {
      if (!info) return;
      console.log("connecting to websocket");
      return LcuWebSocket.connect(info);
    },
    {
      refreshDeps: [info],
      ready: !!info,
      cacheKey: "lcu_websocket",
    }
  );

  useUnmount(() => {
    websocket?.close();
  });

  return websocket;
}

export function useLcuEvent(event: string, callback: (data: unknown) => void) {
  const websocket = useLcuWebSocket();

  useEffect(() => {
    if (!websocket) return;

    const disposable = websocket.subscribe(event, callback);
    return () => {
      disposable();
    };
  }, [websocket, event, callback]);
}

export function useLcuCall(
  cmd: Endpoint,
  options?: RequestOptions<EndpointSchema<Endpoint>>
) {
  const websocket = useLcuWebSocket();

  return useRequest(
    async () => {
      if (!websocket) throw new Error("Websocket is not connected");
      return await websocket.call(cmd);
    },
    {
      ...options,
      refreshDeps: [
        websocket,
        ...(options?.refreshDeps ? options.refreshDeps : []),
      ],
      ready: !!websocket,
    }
  );
}
