import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLcuApi } from "@/hooks";
import { summonerSchema, teamMemberSchema } from "@/lcu/types";
import { cn } from "@/utils/tailwind";
import { z } from "zod";

type LoLIconProps =
  | Omit<React.ComponentProps<typeof Avatar>, "children"> &
      (
        | {
            profileIconId: z.infer<typeof summonerSchema>["profileIconId"];
            championId?: undefined;
          }
        | {
            profileIconId?: undefined;
            championId: z.infer<typeof teamMemberSchema>["championId"];
          }
      );

export function LoLIcon({
  className,
  profileIconId,
  championId,
  ...props
}: LoLIconProps) {
  const endpoint = profileIconId
    ? "/lol-game-data/assets/v1/profile-icons/:id.jpg"
    : "/lol-game-data/assets/v1/champion-icons/:id.png";
  const id = profileIconId ?? championId;
  const alt = profileIconId ? "Profile Icon" : "Champion Icon";
  const cacheKey = profileIconId
    ? `profile-icon-${profileIconId}`
    : `champion-icon-${championId}`;

  const { data, error } = useLcuApi(endpoint, {
    params: { id: id.toString() },
    hookOptions: {
      cacheKey,
      staleTime: 30 * 60 * 1000,
    },
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      const url = URL.createObjectURL(data);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [data]);

  return (
    <Avatar className={cn(className)} {...props}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={`${alt} ${id}`} />
      ) : (
        <AvatarFallback className="bg-destructive/50">
          {error ? "!" : "..."}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
