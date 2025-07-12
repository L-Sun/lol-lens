import { useRequest } from "ahooks";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { translations, TranslationValue } from "@/i18n";
import { EventName, EventPayload } from "@/lcu/events";
import { endpointFetch } from "@/lcu/fetch";
import { LcuInfoContext, LcuWebSocketContext } from "@/lcu/provider";

import {
  EndpointParamsType,
  EndpointQueryType,
  EndpointReturnType,
  Endpoints,
} from "./lcu/endpoints";

type RequestOptions<TData> = NonNullable<
  Parameters<typeof useRequest<TData, []>>[1]
>;

export function useLcuApi<E extends Endpoints>(
  endpoint: E,
  options?: {
    params?: EndpointParamsType<E>;
    query?: EndpointQueryType<E>;
    init?: RequestInit;
    hookOptions?: RequestOptions<EndpointReturnType<E>>;
  }
) {
  const { params, query, init, hookOptions } = options ?? {};

  const info = useContext(LcuInfoContext);

  return useRequest(
    async () => {
      if (!info.running) throw new Error("LCU is not running");

      const result = await endpointFetch<E>(
        endpoint,
        info,
        params,
        query,
        init
      );
      return result;
    },
    {
      ...hookOptions,
      refreshDeps: [info, ...(hookOptions?.refreshDeps ?? [])],
      ready: info.running && (hookOptions?.ready ?? true),
    }
  );
}

export function useLcuApiWithCache<E extends Endpoints>(
  endpoint: E,
  options?: {
    params?: EndpointParamsType<E>;
    query?: EndpointQueryType<E>;
    hookOptions?: Omit<RequestOptions<EndpointReturnType<E>>, "cacheKey">;
  }
) {
  let cacheKey: string = endpoint;
  if (options?.params) {
    cacheKey = `${cacheKey}-${JSON.stringify(options.params)}`;
  }
  if (options?.query) {
    cacheKey = `${cacheKey}-${JSON.stringify(options.query)}`;
  }

  return useLcuApi<E>(endpoint, {
    ...options,
    hookOptions: {
      ...options?.hookOptions,
      cacheKey,
    },
  });
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
