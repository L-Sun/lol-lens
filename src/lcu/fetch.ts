import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import { LcuInfo } from "./types";

export async function fetch(
  endpoint: string,
  info: LcuInfo,
  init?: RequestInit
) {
  const response = await tauriFetch(
    `https://127.0.0.1:${info.port}${endpoint}`,
    {
      ...init,
      headers: {
        Authorization: `Basic ${info.token}`,
        ...init?.headers,
      },
    }
  );

  return response;
}
