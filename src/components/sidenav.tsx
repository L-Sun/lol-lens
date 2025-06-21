import { Link, useLocation } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/i18n";

import { RouterInfo } from "../router";
import { LolStatusIndicator } from "./lol-status-indicator";

type SideNavProps = {
  routerInfos: RouterInfo[];
};

export function SideNav({ routerInfos }: SideNavProps) {
  const { pathname } = useLocation();
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <nav className="flex flex-1 flex-col items-center gap-2 p-2">
        <TooltipProvider>
          {routerInfos.map((route) => {
            if (!route.NavIcon) return null;

            const isActive = route.index
              ? pathname === "/"
              : pathname === route.path;
            const title = route.index ? t["nav.me"]() : t["nav.debug"]();

            return (
              <Tooltip key={route.path}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="icon"
                    asChild
                  >
                    <Link to={route.path}>
                      <route.NavIcon />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="flex justify-center border-t p-2">
        <LolStatusIndicator />
      </div>
    </div>
  );
}
