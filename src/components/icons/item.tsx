import { useMemo } from "react";
import { z } from "zod";

import { LoLIcon, LoLIconProps } from "@/components/icons/lol-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLcuApiWithCache } from "@/hooks";
import { assetItemSchema } from "@/lcu/types";

interface ItemIconProps extends Omit<LoLIconProps, "children" | "path"> {
  itemId: z.infer<typeof assetItemSchema>["id"];
  tooltip?: boolean;
}

export function ItemIcon({ itemId, tooltip = true }: ItemIconProps) {
  const { data } = useLcuApiWithCache("/lol-game-data/assets/v1/items.json");

  const itemInfo = useMemo(() => {
    return data?.find((item) => item.id === itemId);
  }, [data, itemId]);

  return itemInfo ? (
    tooltip ? (
      <Tooltip>
        <TooltipTrigger>
          <LoLIcon
            className="inline-block rounded-none border-2"
            path={itemInfo.iconPath}
          />
        </TooltipTrigger>
        <TooltipContent>{itemInfo.name}</TooltipContent>
      </Tooltip>
    ) : (
      <LoLIcon
        className="inline-block rounded-none border-2"
        path={itemInfo.iconPath}
      />
    )
  ) : (
    <LoLIcon
      className="inline-block rounded-none border-2"
      path="/lol-game-data/assets/ASSETS/Items/Icons2D/gp_ui_placeholder.png"
    />
  );
}
