import PersonIcon from "@mui/icons-material/Person";
import { ComponentType } from "react";
import { createBrowserRouter } from "react-router";

import App from "./app";
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
];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: routerInfos,
  },
]);
