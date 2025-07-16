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
import { assetItemSchema } from "@/lcu/types";

interface ItemIconProps extends Omit<LoLIconProps, "children" | "path"> {
  itemId: z.infer<typeof assetItemSchema>["id"];
  tooltip?: boolean;
}

export function ItemIcon({ itemId, tooltip = true, ...props }: ItemIconProps) {
  const { data } = useLcuApiWithCache("/lol-game-data/assets/v1/items.json");

  const itemInfo = useMemo(() => {
    return data?.find((item) => item.id === itemId);
  }, [data, itemId]);

  return itemInfo ? (
    tooltip ? (
      <Tooltip>
        <TooltipTrigger>
          <LoLIcon path={itemInfo.iconPath} {...props} />
        </TooltipTrigger>
        <TooltipContent>{itemInfo.name}</TooltipContent>
      </Tooltip>
    ) : (
      <LoLIcon path={itemInfo.iconPath} {...props} />
    )
  ) : (
    <LoLIcon path={ITEM_PLACEHOLDER_PATH} {...props} />
  );
}
