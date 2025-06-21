import { Bug, User } from "lucide-react";
import { ComponentType } from "react";
import { createBrowserRouter } from "react-router";

import App from "./app";
import { Debug } from "./pages/debug";
import { Me } from "./pages/me";

export type RouterInfo = Parameters<typeof createBrowserRouter>[0][number] & {
  path: string;
  NavIcon?: ComponentType;
};

export const routerInfos: RouterInfo[] = [
  {
    index: true,
    path: "/",
    Component: Me,
    NavIcon: User,
  },
  {
    path: "/debug",
    Component: Debug,
    NavIcon: Bug,
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: routerInfos,
  },
]);
