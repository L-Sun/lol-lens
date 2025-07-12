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

interface PerkIconProps extends Omit<LoLIconProps, "path"> {
  perkId: z.infer<typeof perkSchema>["id"];
  tooltip?: boolean;
}

export function PerkIcon({ perkId, tooltip = true, ...props }: PerkIconProps) {
  const { data } = useLcuApiWithCache("/lol-game-data/assets/v1/perks.json", {
    hookOptions: {
      staleTime: -1,
    },
  });

  const perkInfo = useMemo(() => {
    return data?.find((perk) => perk.id === perkId);
  }, [data, perkId]);

  return perkInfo ? (
    tooltip ? (
      <Tooltip>
        <TooltipTrigger>
          <LoLIcon path={perkInfo.iconPath} {...props} />
        </TooltipTrigger>
        <TooltipContent>{perkInfo.name}</TooltipContent>
      </Tooltip>
    ) : (
      <LoLIcon path={perkInfo.iconPath} {...props} />
    )
  ) : null;
}
