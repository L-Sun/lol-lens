import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import { LcuPortToken } from "./types";

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
