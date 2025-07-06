import { useEventListener } from "ahooks";
import { useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";

import { ChampionIcon, ProfileIcon } from "@/components/lol-icon";
import { PlayerWinLoseBadge } from "@/components/player/player-win-lose-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLcuApi } from "@/hooks";
import { summonerSchema, teamMemberSchema } from "@/lcu/types";

interface PlayerCardProps {
  championId?: z.infer<typeof teamMemberSchema>["championId"];
  puuid: z.infer<typeof summonerSchema>["puuid"];
}

export function PlayerCard({ championId, puuid, ...props }: PlayerCardProps) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const { data: summonerData } = useLcuApi(
    "/lol-summoner/v2/summoners/puuid/:puuid",
    {
      params: { puuid },
      hookOptions: {
        loadingDelay: 1000,
        cacheKey: `summoners-puuid-${puuid}`,
      },
    }
  );

  const { profileIconId, gameName, tagLine, summonerLevel } =
    summonerData || {};

  const icon = useMemo(() => {
    if (championId !== undefined && profileIconId !== undefined) {
      return (
        <div className="relative">
          <ChampionIcon className="size-14" championId={championId} />
          <ProfileIcon
            className="size-6 absolute -bottom-1 -right-1"
            profileIconId={profileIconId}
          />
        </div>
      );
    } else if (profileIconId !== undefined) {
      return <ProfileIcon className="size-14" profileIconId={profileIconId} />;
    } else {
      return <Skeleton className="rounded-full size-14" />;
    }
  }, [championId, profileIconId]);

  useEventListener(
    "click",
    () => {
      Promise.resolve(navigate(`/user/${puuid}`)).catch(console.error);
    },
    { target: ref }
  );

  return (
    <Card ref={ref} className="max-w-xs" clickable {...props}>
      <CardContent className="flex flex-row gap-4">
        {icon}
        <div className="flex flex-col gap-3">
          <CardTitle>
            {gameName && tagLine ? (
              `${gameName} #${tagLine}`
            ) : (
              <Skeleton className="w-32 h-[1em]" />
            )}
          </CardTitle>
          <CardDescription className="flex flex-row gap-2 items-center">
            {summonerLevel ? (
              <span className="min-w-12">Lv. {summonerLevel}</span>
            ) : (
              <Skeleton className="min-w-12 h-[1em]" />
            )}
            <PlayerWinLoseBadge puuid={puuid} />
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
