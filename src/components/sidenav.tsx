import { Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/hooks";

import { NavInfo } from "../router";
import { LolStatusIndicator } from "./lol-status-indicator";

type SideNavProps = {
  routerInfos: NavInfo[];
};

export function SideNav({ routerInfos }: SideNavProps) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <nav className="flex flex-1 flex-col items-center gap-2 p-2">
        {routerInfos.map((route) => {
          if (!route.NavIcon) return null;

          const isActive = route.index
            ? pathname === "/"
            : pathname === route.path;

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
                <p>{t[route.tooltip]()}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Separator />
      <div className="flex flex-col gap-2 p-2">
        <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
          {theme === "dark" ? <Moon /> : <Sun />}
        </Button>
      </div>
      <div className="flex justify-center p-2">
        <LolStatusIndicator />
      </div>
    </div>
  );
}
