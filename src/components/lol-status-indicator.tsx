import { useContext } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/hooks";
import { LcuInfoContext } from "@/lcu/provider";

export function LolStatusIndicator() {
  const { running } = useContext(LcuInfoContext);

  const { t } = useI18n();

  const statusText = running
    ? t["com.lol.status.running"]()
    : t["com.lol.status.not-running"]();

  return (
    <Tooltip>
      <TooltipTrigger className="flex h-6 w-6 items-center justify-center">
        <div
          className={`h-2 w-2 rounded-full ${
            running ? "bg-green-500" : "bg-muted-foreground"
          }`}
        />
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{statusText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
