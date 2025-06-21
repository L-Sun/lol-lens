import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLOLRunningState } from "@/hooks";
import { useI18n } from "@/i18n";

export function LolStatusIndicator() {
  const isLolRunning = useLOLRunningState();
  const { t } = useI18n();

  const statusText = isLolRunning
    ? t["com.lol.status.running"]()
    : t["com.lol.status.not-running"]();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex h-6 w-6 items-center justify-center">
          <div
            className={`h-2 w-2 rounded-full ${
              isLolRunning ? "bg-green-500" : "bg-muted-foreground"
            }`}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{statusText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
