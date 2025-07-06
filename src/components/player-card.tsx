import { z } from "zod";

import {
  Card,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLcuApi } from "@/hooks";
import { teamMemberSchema, summonerSchema } from "@/lcu/types";
import { LoLIcon } from "@/components/lol-icon";
import { PlayerWinLoseBadge } from "@/components/player-win-lose-badge";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";

interface PlayerCardProps {
  championId?: z.infer<typeof teamMemberSchema>["championId"];
  puuid: z.infer<typeof summonerSchema>["puuid"];
}

export function PlayerCard({ championId, puuid, ...props }: PlayerCardProps) {
  const navigate = useNavigate();

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
          <LoLIcon className="size-14" championId={championId} />
          <LoLIcon
            className="size-6 absolute -bottom-1 -right-1"
            profileIconId={profileIconId}
          />
        </div>
      );
    } else if (profileIconId !== undefined) {
      return <LoLIcon className="size-14" profileIconId={profileIconId} />;
    } else {
      return <Skeleton className="rounded-full size-14" />;
    }
  }, [championId, profileIconId]);

  const handleClick = useCallback(() => {
    navigate(`/user/${puuid}`);
  }, [navigate, puuid]);

  return (
    <Card className="max-w-xs" clickable onClick={handleClick} {...props}>
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
