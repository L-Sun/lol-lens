import { Badge } from "@/components/ui/badge";
import { useLcuApi } from "@/hooks";
import { summonerSchema } from "@/lcu/types";
import { useMemo } from "react";
import { z } from "zod";

type PlayerWinLoseBadgeProps = {
  puuid: z.infer<typeof summonerSchema>["puuid"];
};

export function PlayerWinLoseBadge({ puuid }: PlayerWinLoseBadgeProps) {
  const { data: matchData, loading } = useLcuApi(
    "/lol-match-history/v1/products/lol/:puuid/matches",
    { params: { puuid }, hookOptions: { cacheKey: puuid } }
  );

  const { wins, losses } = useMemo(() => {
    if (!matchData) return { wins: 0, losses: 0 };

    const filterGames = (type: "win" | "loss") => {
      return matchData.games.games.filter((game) => {
        const participantId = game.participantIdentities.find(
          (identity) => identity.player.puuid === puuid
        )?.participantId;
        if (!participantId) return false;

        const participant = game.participants.find(
          (participant) => participant.participantId === participantId
        );
        if (!participant) return false;

        return type === "win" ? participant.stats.win : !participant.stats.win;
      });
    };

    return {
      wins: filterGames("win").length,
      losses: filterGames("loss").length,
    };
  }, [matchData]);

  if (loading || !matchData) {
    return <Badge>Loading...</Badge>;
  }

  return (
    <div className="inline-flex">
      <Badge variant="default" className="rounded-r-none">
        {wins} W
      </Badge>
      <Badge variant="secondary" className="rounded-l-none">
        {losses} L
      </Badge>
    </div>
  );
}
