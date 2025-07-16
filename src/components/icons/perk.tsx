import { useMemo } from "react";
import { z } from "zod";

import { LoLIcon, LoLIconProps } from "@/components/icons/lol-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLcuApiWithCache } from "@/hooks";
import { perkSchema } from "@/lcu/types";
import { cn } from "@/utils";

interface PerkIconProps extends Omit<LoLIconProps, "path"> {
  perkStyleId: z.infer<typeof perkSchema>["id"];
  tooltip?: boolean;
}

export function PerkStyleIcon({
  perkStyleId,
  tooltip = true,
  imgClassName,
  ...props
}: PerkIconProps) {
  const { data } = useLcuApiWithCache(
    "/lol-game-data/assets/v1/perkstyles.json",
    {
      hookOptions: {
        staleTime: -1,
      },
    }
  );

  const perkInfo = useMemo(() => {
    return data?.styles.find((perk) => perk.id === perkStyleId);
  }, [data, perkStyleId]);

  return perkInfo ? (
    tooltip ? (
      <Tooltip>
        <TooltipTrigger>
          <LoLIcon
            path={perkInfo.iconPath}
            imgClassName={cn(imgClassName, "scale-80")}
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent>{perkInfo.name}</TooltipContent>
      </Tooltip>
    ) : (
      <LoLIcon path={perkInfo.iconPath} {...props} />
    )
  ) : null;
}
