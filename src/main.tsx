import "@/i18n";
import "@/index.css";

import { configure, getConsoleSink } from "@logtape/logtape";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import { router } from "@/router";

await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: ["logtape", "meta"], lowestLevel: "error" },
    { category: "lol-len", lowestLevel: "trace", sinks: ["console"] },
    { category: ["lol-len", "lcu"], lowestLevel: "trace", sinks: ["console"] },
  ],
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
