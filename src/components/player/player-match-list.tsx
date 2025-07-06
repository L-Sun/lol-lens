import { z } from "zod";

import { PlayerMatchCard } from "@/components/player/player-match-card";
import { useLcuApi } from "@/hooks";
import { summonerSchema } from "@/lcu/types";

interface PlayerMatchListProps {
  puuid: z.infer<typeof summonerSchema>["puuid"];
}

export function PlayerMatchList({ puuid }: PlayerMatchListProps) {
  const { data: matchData } = useLcuApi(
    "/lol-match-history/v1/products/lol/:puuid/matches",
    {
      params: { puuid },
    }
  );

  if (!matchData) return null;

  return (
    <ul>
      {matchData.games.games.map((game) => {
        return (
          <li key={game.gameId}>
            <PlayerMatchCard gameId={game.gameId} info={game.participants[0]} />
          </li>
        );
      })}
    </ul>
  );
}
