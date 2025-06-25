import { invoke } from "@tauri-apps/api/core";
import { useInterval, useRequest, useUnmount } from "ahooks";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { translations, TranslationValue } from "@/i18n";
import { LcuInfo, LcuInfoContext } from "@/lcu/context";
import { fetch } from "@/lcu/fetch";
import {
  Endpoint,
  EndpointReturnType,
  EndpointSchema,
  getEndpointSchema,
  jsonSchema,
  LcuPortTokenSchema,
} from "@/lcu/types";
import { LcuWebSocket } from "@/lcu/ws";

type RequestOptions<TData> = Parameters<typeof useRequest<TData, []>>[1];

export function useLcuInfo() {
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

  return info;
}

export function useLcuApi<E extends Endpoint>(
  endpoint: E,
  init?: RequestInit,
  options?: RequestOptions<EndpointReturnType<E>>
) {
  const info = useContext(LcuInfoContext);

  return useRequest(
    async () => {
      if (!info.running) throw new Error("LCU is not running");
      const response = await fetch(endpoint, info, init);
      const contentType = response.headers.get("Content-Type");

      if (!contentType?.includes("application/json")) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const schema = getEndpointSchema(endpoint) ?? jsonSchema;
      const result: EndpointReturnType<E> = schema.parse(await response.json());

      return result;
    },
    {
      ...options,
      refreshDeps: [info, ...(options?.refreshDeps ?? [])],
    }
  );
}

export function useLcuResource(
  url: string,
  init?: RequestInit,
  options?: RequestOptions<Blob>
) {
  const info = useContext(LcuInfoContext);

  return useRequest(
    async () => {
      if (!info.running) throw new Error("LCU is not running");
      const response = await fetch(url, info, init);
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("image")) {
        return response.blob();
      }
      throw new Error(`Unsupported content type: ${contentType}`);
    },
    {
      ...options,
      refreshDeps: [info, ...(options?.refreshDeps ?? [])],
      cacheKey: options?.cacheKey ?? url,
    }
  );
}

export function useLcuWebSocket() {
  const info = useContext(LcuInfoContext);

  const { data: websocket } = useRequest(
    async () => {
      if (!info.running) throw new Error("LCU is not running");
      return LcuWebSocket.connect(info);
    },
    {
      refreshDeps: [info],
      ready: !!info.running,
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
    }
  );
}

export function useI18n() {
  const { t: _t } = useTranslation();

  const t = useMemo(() => {
    return new Proxy({} as TranslationValue, {
      get: (_, key: keyof typeof translations) => {
        return () => _t(key);
      },
    });
  }, [_t]);

  return { t };
}
