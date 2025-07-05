import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import {
  EndpointParams,
  EndpointReturnType,
  endpoints,
  Endpoints,
} from "@/lcu/endpoints";

import { LcuPortToken } from "./types";
import { compile } from "path-to-regexp";
import { z } from "zod";

export async function fetch(
  endpoint: string,
  portToken: LcuPortToken,
  init?: RequestInit
) {
  const { port, token } = portToken;
  const response = await tauriFetch(`https://127.0.0.1:${port}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Basic ${token}`,
      ...init?.headers,
    },
  });

  return response;
}

type ExtractParams<T extends string> =
  T extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}/:${infer Param}`
    ? Param
    : never;

export type ParamsToRecord<T extends string> = {
  [K in ExtractParams<T>]: string;
};

export async function endpointFetch<E extends Endpoints>(
  endpoint: E,
  portToken: LcuPortToken,
  params?: EndpointParams<E>,
  query?: z.infer<NonNullable<(typeof endpoints)[E]["paramsSchema"]>>,
  init?: RequestInit
): Promise<EndpointReturnType<E>> {
  if (!(endpoint in endpoints)) {
    throw new Error(`Endpoint ${endpoint} not found`);
  }

  const { port, token } = portToken;

  const path = compile<ParamsToRecord<E>>(endpoint)(params);

  let url = new URL(`https://127.0.0.1:${port}${path}`);
  const method = endpoints[endpoint].method;
  if (query && method === "GET") {
    if (endpoints[endpoint].paramsSchema) {
      const parsedParams = endpoints[endpoint].paramsSchema.parse(query);
      query = parsedParams;
    }
    const queryString = new URLSearchParams(query).toString();
    url.search = queryString;
  }

  const response = await tauriFetch(url.toString(), {
    ...init,
    method,
    headers: {
      Authorization: `Basic ${token}`,
      ...init?.headers,
    },
  });

  const contentType = response.headers.get("Content-Type");
  if (!contentType?.includes("application/json")) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const data = await response.json();
  console.log(data);

  return endpoints[endpoint].returnSchema.parse(data);
}
