import { CSSProperties, useMemo } from "react";

import { PlayerCard } from "@/components/player/player-card";
import { useI18n, useLcuApi, useLcuEvent } from "@/hooks";

export function CurrentMatch() {
  useLcuEvent("lol-gameflow_v1_session");
  const { data: matchData } = useLcuApi("/lol-gameflow/v1/session");
  const { data: currentSummoner } = useLcuApi(
    "/lol-summoner/v1/current-summoner",
    {
      hookOptions: {
        cacheKey: "current-summoner-in-match",
        staleTime: -1, // only use the id
      },
    },
  );
  const { t } = useI18n();

  const { myTeam, enemyTeam } = useMemo(() => {
    if (!matchData || !currentSummoner) return { myTeam: [], enemyTeam: [] };
    const inTeamOne = matchData.gameData.teamOne.some(
      (player) => player.puuid === currentSummoner.puuid,
    );
    return {
      myTeam: inTeamOne
        ? matchData.gameData.teamOne
        : matchData.gameData.teamTwo,
      enemyTeam: inTeamOne
        ? matchData.gameData.teamTwo
        : matchData.gameData.teamOne,
    };
  }, [matchData, currentSummoner]);

  const playerTeamColor = useMemo(() => {
    const players = [...myTeam, ...enemyTeam];
    const teamPlayers = new Map<number, string[]>();

    players.forEach((player) => {
      const team = player.teamParticipantId;
      teamPlayers.set(team, [...(teamPlayers.get(team) ?? []), player.puuid]);
    });

    let colorIndex = 0;
    const colors = [
      "var(--color-sky-500)",
      "var(--color-rose-500)",
      "var(--color-emerald-500)",
      "var(--color-amber-500)",
      "var(--color-violet-500)",
      "var(--color-orange-500)",
      "var(--color-pink-500)",
      "var(--color-cyan-500)",
      "var(--color-lime-500)",
      "var(--color-indigo-500)",
    ];

    const playerColorMap = new Map<string, CSSProperties>();
    teamPlayers.forEach((players) => {
      if (players.length >= 2) {
        players.forEach((puuid) => {
          playerColorMap.set(puuid, {
            borderColor: colors[colorIndex],
          });
        });
        colorIndex++;
      }
    });

    return playerColorMap;
  }, [myTeam, enemyTeam]);

  if (
    !matchData ||
    !currentSummoner ||
    matchData.gameData.teamOne.length === 0 ||
    matchData.gameData.teamTwo.length === 0
  ) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-2xl font-semibold text-muted-foreground text-center">
          {t["page.current-match.loading"]()}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">当前对局</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600">蓝队</h3>
          <div className="space-y-3">
            {myTeam.map((player) => (
              <PlayerCard
                className="border-2"
                style={playerTeamColor.get(player.puuid)}
                key={player.puuid}
                championId={player.championId}
                puuid={player.puuid}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-600">红队</h3>
          <div className="space-y-3">
            {enemyTeam.map((player) => (
              <PlayerCard
                className="border-2"
                style={playerTeamColor.get(player.puuid)}
                key={player.puuid}
                championId={player.championId}
                puuid={player.puuid}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
