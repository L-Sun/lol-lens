import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { compile } from "path-to-regexp";

import {
  EndpointParamsType,
  EndpointQueryType,
  EndpointReturnType,
  Endpoints,
  endpoints,
} from "@/lcu/endpoints";

import { blobSchema, LcuPortToken } from "./types";

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

export async function endpointFetch<E extends Endpoints>(
  endpoint: E,
  portToken: LcuPortToken,
  params?: EndpointParamsType<E>,
  query?: EndpointQueryType<E>,
  init?: RequestInit
): Promise<EndpointReturnType<E>> {
  if (!(endpoint in endpoints)) {
    throw new Error(`Endpoint ${endpoint} not found`);
  }

  const { port, token } = portToken;

  const path = compile<EndpointParamsType<E>>(endpoint)(params);

  const url = new URL(`https://127.0.0.1:${port}${path}`);
  const method = endpoints[endpoint].method;
  if (query && method === "GET") {
    const querySchema = endpoints[endpoint].querySchema;
    if (querySchema) {
      querySchema.parse(query);
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

  const returnSchema = endpoints[endpoint].returnSchema;
  if (returnSchema === blobSchema) {
    return returnSchema.parse(await response.blob());
  } else {
    if (!contentType?.includes("application/json")) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
    return returnSchema.parse(await response.json());
  }
}
