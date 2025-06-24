import { createContext } from "react";

import { LcuPortToken } from "./types";

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
