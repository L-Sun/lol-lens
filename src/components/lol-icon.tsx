import { useRequest } from "ahooks";
import { useContext, useEffect, useState } from "react";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLcuApi } from "@/hooks";
import { fetch } from "@/lcu/fetch";
import { LcuInfoContext } from "@/lcu/provider";
import { assetItemSchema, summonerSchema, teamMemberSchema } from "@/lcu/types";
import { cn } from "@/utils/tailwind";

interface ChampionIconProps
  extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  championId: z.infer<typeof teamMemberSchema>["championId"];
}

export function ChampionIcon({ championId, ...props }: ChampionIconProps) {
  const { data } = useLcuApi(
    "/lol-game-data/assets/v1/champion-icons/:id.png",
    {
      params: { id: championId.toString() },
      hookOptions: {
        cacheKey: `champion-icon-${championId}`,
        staleTime: -1,
      },
    }
  );

  return <LoLIconImpl blob={data} {...props} />;
}

interface ProfileIconProps
  extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  profileIconId: z.infer<typeof summonerSchema>["profileIconId"];
}

export function ProfileIcon({ profileIconId, ...props }: ProfileIconProps) {
  const { data } = useLcuApi("/lol-game-data/assets/v1/profile-icons/:id.jpg", {
    params: { id: profileIconId.toString() },
    hookOptions: {
      cacheKey: `profile-icon-${profileIconId}`,
      staleTime: -1,
    },
  });

  return <LoLIconImpl blob={data} {...props} />;
}

interface ItemIconProps
  extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  itemId: z.infer<typeof assetItemSchema>["id"];
}

export function ItemIcon({ itemId, ...props }: ItemIconProps) {
  const { data: itemInfos } = useLcuApi("/lol-game-data/assets/v1/items.json", {
    hookOptions: {
      cacheKey: `item-icon-infos`,
      staleTime: -1,
    },
  });

  const info = useContext(LcuInfoContext);

  const { data: blob } = useRequest(
    async () => {
      if (!itemInfos || !info.running) return;

      const itemInfo = itemInfos.find((item) => item.id === itemId);
      if (!itemInfo) return;

      const { iconPath } = itemInfo;

      const response = await fetch(iconPath, info);
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("image")) return;

      return await response.blob();
    },
    {
      ready: !!itemInfos && info.running,
      cacheKey: `item-icon-${itemId}`,
      staleTime: -1,
    }
  );

  return <LoLIconImpl blob={blob} {...props} />;
}

interface LoLIconImplProps
  extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  blob: Blob | undefined;
}
function LoLIconImpl({ className, blob, ...props }: LoLIconImplProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      let url: string | undefined;
      try {
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (error) {
        console.error(error);
      }

      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [blob]);

  return (
    <Avatar className={cn(className)} {...props}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} />
      ) : (
        <AvatarFallback className="bg-destructive/50" />
      )}
    </Avatar>
  );
}
