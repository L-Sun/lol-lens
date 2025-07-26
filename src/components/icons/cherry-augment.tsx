import { useMemo } from "react";
import { z } from "zod";

import { LoLIcon, LoLIconProps } from "@/components/icons/lol-icon";
import { ITEM_PLACEHOLDER_PATH } from "@/components/icons/placeholder";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLcuApiWithCache } from "@/hooks";
import { cherryAugmentSchema } from "@/lcu/schemas";
import { cn } from "@/utils";

interface CherryAugmentProps extends Omit<LoLIconProps, "children" | "path"> {
  cherryAugmentId: z.infer<typeof cherryAugmentSchema>["id"];
  tooltip?: boolean;
}

export function CherryAugmentIcon({
  cherryAugmentId,
  tooltip = true,
  ...props
}: CherryAugmentProps) {
  const { data } = useLcuApiWithCache(
    "/lol-game-data/assets/v1/cherry-augments.json",
    {
      hookOptions: {
        staleTime: -1,
      },
    },
  );

  const augmentInfo = useMemo(() => {
    return data?.find((augment) => augment.id === cherryAugmentId);
  }, [data, cherryAugmentId]);

  return augmentInfo ? (
    tooltip ? (
      <Tooltip>
        <TooltipTrigger>
          <div className="relative bg-black">
            <LoLIcon path={augmentInfo.augmentSmallIconPath} {...props} />
            <div
              className={cn(
                "absolute inset-0 mix-blend-multiply",
                augmentInfo.rarity === "kBronze" &&
                  "bg-[#8B4513] brightness-110 contrast-125 saturate-150",
                augmentInfo.rarity === "kSilver" &&
                  "bg-[#C0C0C0] brightness-125 contrast-110 saturate-75",
                augmentInfo.rarity === "kGold" &&
                  "bg-[linear-gradient(45deg,#7a6248_0%,#9a7e5d_25%,#c9a876_50%,#f4e6a1_75%,#fff8dc_100%)]",
                augmentInfo.rarity === "kPrismatic" &&
                  "bg-[linear-gradient(45deg,#ff69b4_10%,#ffb3d9_30%,#e6e6fa_50%,#c0c0c0_70%,#b8860b_90%)]",
              )}
            ></div>
          </div>
        </TooltipTrigger>
        <TooltipContent>{augmentInfo.nameTRA}</TooltipContent>
      </Tooltip>
    ) : (
      <LoLIcon path={augmentInfo.augmentSmallIconPath} {...props} />
    )
  ) : (
    <LoLIcon path={ITEM_PLACEHOLDER_PATH} {...props} />
  );
}
