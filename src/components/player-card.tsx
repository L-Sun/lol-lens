import { z } from "zod";

import {
  Card,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLcuApi } from "@/hooks";
import { summonerSchema } from "@/lcu/types";
import { ProfileIcon } from "@/components/profile-icon";
import { PlayerWinLoseBadge } from "@/components/player-win-lose-badge";

type PlayerCardProps = {
  puuid: z.infer<typeof summonerSchema>["puuid"];
};

export function PlayerCard({ puuid }: PlayerCardProps) {
  const { data: summonerData, loading } = useLcuApi(
    "/lol-summoner/v2/summoners/puuid/:puuid",
    { params: { puuid } }
  );

  if (loading || !summonerData) {
    return (
      <Card className="max-w-xs">
        <CardContent className="flex flex-row gap-4">
          <Skeleton className="rounded-full size-14" />
          <div className="flex flex-col gap-2">
            <CardTitle>
              <Skeleton className="w-32 h-[1em]" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="w-16 h-[1em]" />
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { gameName, tagLine, summonerLevel, profileIconId } = summonerData;

  return (
    <Card className="max-w-xs">
      <CardContent className="flex flex-row gap-4">
        <ProfileIcon className="size-14" profileIconId={profileIconId} />
        <div className="flex flex-col gap-3">
          <CardTitle>
            {gameName} #{tagLine}
          </CardTitle>
          <CardDescription className="flex flex-row gap-2 items-center">
            <span>Lv. {summonerLevel}</span>
            <PlayerWinLoseBadge puuid={puuid} />
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
