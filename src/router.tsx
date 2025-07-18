import { Bug, SwordsIcon, User } from "lucide-react";
import { ComponentType } from "react";
import { createBrowserRouter } from "react-router";

import App from "@/app";
import type { TranslationKey } from "@/i18n";
import { CurrentMatch } from "@/pages/current-match";
import { Debug } from "@/pages/debug";
import { UserInfo } from "@/pages/user";

export type NavInfo = Parameters<typeof createBrowserRouter>[0][number] & {
  path: string;
  NavIcon: ComponentType;
  tooltip: TranslationKey;
};

export const navInfos: NavInfo[] = [
  {
    path: "/me",
    Component: UserInfo,
    NavIcon: User,
    tooltip: "nav.me",
  },
  {
    path: "/current-match",
    Component: CurrentMatch,
    NavIcon: SwordsIcon,
    tooltip: "nav.current-match",
  },
  {
    path: "/debug",
    Component: Debug,
    NavIcon: Bug,
    tooltip: "nav.debug",
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      ...navInfos,
      {
        path: "/user/:userId",
        Component: UserInfo,
      },
    ],
  },
]);
