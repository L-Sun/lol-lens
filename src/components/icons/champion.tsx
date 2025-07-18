import { z } from "zod";

import { LoLIconImpl, LoLIconImplProps } from "@/components/icons/lol-icon";
import { useLcuApiWithCache } from "@/hooks";
import { teamMemberSchema } from "@/lcu/types";
import { cn } from "@/utils";

interface ChampionIconProps
  extends Omit<LoLIconImplProps, "children" | "blob"> {
  championId: z.infer<typeof teamMemberSchema>["championId"];
}

export function ChampionIcon({
  championId,
  imgClassName,
  ...props
}: ChampionIconProps) {
  const { data } = useLcuApiWithCache(
    "/lol-game-data/assets/v1/champion-icons/:id.png",
    {
      params: { id: championId.toString() },
      hookOptions: {
        staleTime: -1,
      },
    },
  );

  return (
    <LoLIconImpl
      blob={data}
      imgClassName={cn(imgClassName, "scale-110")}
      {...props}
    />
  );
}
