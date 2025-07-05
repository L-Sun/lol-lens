import { useRequest } from "ahooks";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { translations, TranslationValue } from "@/i18n";
import { EventName, EventPayload } from "@/lcu/events";
import { endpointFetch, fetch } from "@/lcu/fetch";
import { LcuInfoContext, LcuWebSocketContext } from "@/lcu/provider";

import { EndpointReturnType, Endpoints } from "./lcu/endpoints";

type RequestOptions<TData> = Parameters<typeof useRequest<TData, []>>[1];

export function useLcuApi<E extends Endpoints>(
  endpoint: E,
  options?: {
    params?: Parameters<typeof endpointFetch<E>>[2];
    query?: Parameters<typeof endpointFetch<E>>[3];
    init?: Parameters<typeof endpointFetch<E>>[4];
    hookOptions?: RequestOptions<EndpointReturnType<E>>;
  }
) {
  const { params, query, init, hookOptions } = options ?? {};

  const info = useContext(LcuInfoContext);

  return useRequest(
    async () => {
      if (!info.running) throw new Error("LCU is not running");
      return endpointFetch(endpoint, info, params, query, init);
    },
    {
      ...hookOptions,
      refreshDeps: [info, ...(hookOptions?.refreshDeps ?? [])],
      ready: info.running && (hookOptions?.ready ?? true),
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
      ready: info.running && (options?.ready ?? true),
    }
  );
}

export function useLcuEvent<E extends EventName>(event: E) {
  const websocket = useContext(LcuWebSocketContext);

  const [data, setData] = useState<EventPayload<E> | undefined>(undefined);

  useEffect(() => {
    if (!websocket) return;

    const disposable = websocket.subscribe(event, (data) => {
      setData(data);
    });
    return () => {
      disposable();
    };
  }, [websocket, event]);

  return data;
}

export function useLcuCall<E extends Endpoints>(
  cmd: E,
  options?: RequestOptions<EndpointReturnType<E>>
) {
  const websocket = useContext(LcuWebSocketContext);

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

export function useChampionIcon(championId: number) {
  return useLcuResource(
    `/lol-game-data/assets/v1/champion-icons/${championId}.png`,
    undefined,
    {
      cacheKey: `champion-icon-${championId}`,
    }
  );
}

export function useProfileIcon(iconId: number) {
  return useLcuResource(
    `/lol-game-data/assets/v1/profile-icons/${iconId}.jpg`,
    undefined,
    {
      cacheKey: `profile-icon-${iconId}`,
    }
  );
}
