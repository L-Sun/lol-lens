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
        cacheKey: `summoners-puuid-${puuid}`,
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
          <Skeleton className="rounded-full size-14" />
          <div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-1"></div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <CardTitle className="truncate">
              <Skeleton className="w-32 h-[1em]" />
            </CardTitle>
            <CardDescription className="flex flex-row gap-2 items-center">
              <Skeleton className="min-w-12 h-[1em]" />
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
              className="rounded-full size-14"
              championId={championId}
            />
            <ProfileIcon
              className="rounded-full size-6 absolute -bottom-1 -right-1"
              profileIconId={profileIconId}
            />
          </div>
        ) : (
          <ProfileIcon
            className="rounded-full size-14"
            profileIconId={profileIconId}
          />
        )}
        <div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-1"></div>
        <div className="flex flex-col gap-3 overflow-hidden">
          <CardTitle className="truncate">
            {gameName} #{tagLine}
          </CardTitle>
          <CardDescription className="flex flex-row gap-2 items-center">
            <span className="min-w-12">Lv. {summonerLevel}</span>
            <PlayerWinLoseBadge puuid={puuid} />
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
