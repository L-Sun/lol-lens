import { useMemo } from "react";
import { z } from "zod";

import { LoLIcon, LoLIconProps } from "@/components/icons/lol-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLcuApiWithCache } from "@/hooks";
import { spellSchema } from "@/lcu/types";

interface SpellIconProps extends Omit<LoLIconProps, "children" | "path"> {
  spellId: z.infer<typeof spellSchema>["id"];
  tooltip?: boolean;
}

export function SpellIcon({
  spellId,
  tooltip = true,
  ...props
}: SpellIconProps) {
  const { data } = useLcuApiWithCache(
    "/lol-game-data/assets/v1/summoner-spells.json",
    {
      hookOptions: {
        staleTime: -1,
      },
    }
  );

  const spellInfo = useMemo(() => {
    return data?.find((spell) => spell.id === spellId);
  }, [data, spellId]);

  return spellInfo ? (
    tooltip ? (
      <Tooltip>
        <TooltipTrigger>
          <LoLIcon
            path={spellInfo.iconPath}
            className="rounded-none"
            {...props}
          />
        </TooltipTrigger>
        <TooltipContent>{spellInfo.name}</TooltipContent>
      </Tooltip>
    ) : (
      <LoLIcon path={spellInfo.iconPath} className="rounded-none" {...props} />
    )
  ) : (
    <LoLIcon
      path="/lol-game-data/assets/ASSETS/SummonerIcons/SummonerIcons/UnknownSpell.png"
      className="rounded-none"
    />
  );
}
