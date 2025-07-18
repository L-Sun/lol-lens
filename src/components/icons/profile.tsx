import { z } from "zod";

import { LoLIconImpl, LoLIconImplProps } from "@/components/icons/lol-icon";
import { useLcuApiWithCache } from "@/hooks";
import { summonerSchema } from "@/lcu/types";

export interface ProfileIconProps
  extends Omit<LoLIconImplProps, "children" | "blob"> {
  profileIconId: z.infer<typeof summonerSchema>["profileIconId"];
}

export function ProfileIcon({ profileIconId, ...props }: ProfileIconProps) {
  const { data } = useLcuApiWithCache(
    "/lol-game-data/assets/v1/profile-icons/:id.jpg",
    {
      params: { id: profileIconId.toString() },
      hookOptions: {
        staleTime: -1,
      },
    },
  );

  return <LoLIconImpl blob={data} {...props} />;
}
