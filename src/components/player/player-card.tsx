import { useEventListener } from "ahooks";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";

import { ChampionIcon, ProfileIcon } from "@/components/icons";
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

interface PlayerCardProps extends React.ComponentProps<typeof Card> {
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
        cacheKey: `summoner-data-${puuid}`,
        staleTime: 10 * 60,
      },
    },
  );

  useEventListener(
    "click",
    () => {
      Promise.resolve(navigate(`/user/${puuid}`)).catch(console.error);
    },
    { target: ref },
  );

  if (!summonerData) {
    return (
      <Card ref={ref} className="max-w-xs" clickable {...props}>
        <CardContent className="flex flex-row gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-1"></div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <CardTitle className="truncate">
              <Skeleton className="h-[1em] w-32" />
            </CardTitle>
            <CardDescription className="flex flex-row items-center gap-2">
              <Skeleton className="h-[1em] min-w-12" />
              <PlayerWinLoseBadge puuid={puuid} />
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { profileIconId, gameName, tagLine, summonerLevel } = summonerData;

  return (
    <Card ref={ref} className="max-w-xs" clickable {...props}>
      <CardContent className="flex flex-row gap-4">
        {championId ? (
          <div className="relative">
            <ChampionIcon
              className="size-14 rounded-full"
              championId={championId}
            />
            <ProfileIcon
              className="absolute -right-1 -bottom-1 size-6 rounded-full"
              profileIconId={profileIconId}
            />
          </div>
        ) : (
          <ProfileIcon
            className="size-14 rounded-full"
            profileIconId={profileIconId}
          />
        )}
        <div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-1"></div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <CardTitle className="truncate">
            {gameName} #{tagLine}
          </CardTitle>
          <CardDescription className="flex flex-row items-center gap-2">
            <span className="min-w-12">Lv. {summonerLevel}</span>
            <PlayerWinLoseBadge puuid={puuid} />
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
