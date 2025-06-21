import CodeIcon from "@mui/icons-material/Code";
import PersonIcon from "@mui/icons-material/Person";
import { ComponentType } from "react";
import { createBrowserRouter } from "react-router";

import App from "./app";
import { Debug } from "./pages/debug";
import { Me } from "./pages/me";

export type RouterInfo = Parameters<typeof createBrowserRouter>[0][number] & {
  path: string;
  NavIcon: ComponentType;
};

export const routerInfos: RouterInfo[] = [
  {
    index: true,
    path: "/",
    Component: Me,
    NavIcon: PersonIcon,
  },
  {
    path: "/debug",
    Component: Debug,
    NavIcon: CodeIcon,
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: routerInfos,
  },
]);
