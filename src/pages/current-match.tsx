import { CSSProperties, useMemo } from "react";

import { PlayerCard } from "@/components/player/player-card";
import {
  useBindTwoDataSources,
  useI18n,
  useLcuApi,
  useLcuEvent,
} from "@/hooks";

export function CurrentMatch() {
  const { t } = useI18n();

  const matchDataFromEvent = useLcuEvent("lol-gameflow_v1_session");
  const { data: matchDataFromApi } = useLcuApi("/lol-gameflow/v1/session");
  const matchData = useBindTwoDataSources(matchDataFromEvent, matchDataFromApi);

  const champSelectSessionFromEvent = useLcuEvent(
    "lol-champ-select_v1_session",
  );
  const { data: champSelectSessionFromApi } = useLcuApi(
    "/lol-champ-select/v1/session",
    {
      hookOptions: {
        ready: matchData?.phase === "ChampSelect",
        refreshDeps: [matchData?.phase],
      },
    },
  );
  const champSelectSession = useBindTwoDataSources(
    champSelectSessionFromEvent,
    champSelectSessionFromApi,
  );

  const { data: summonerData } = useLcuApi(
    "/lol-summoner/v1/current-summoner",
    {
      hookOptions: {
        cacheKey: "current-match-summoner-data",
        staleTime: 10 * 60,
      },
    },
  );

  const { myTeam, theirTeam } = useMemo(() => {
    if (matchData?.phase === "ChampSelect") {
      return {
        myTeam: champSelectSession?.myTeam ?? [],
        theirTeam: (champSelectSession?.theirTeam ?? []).filter(
          ({ puuid }) => puuid !== "",
        ),
      };
    } else {
      const inTeamOne = matchData?.gameData.teamOne.some(
        (player) => player.puuid === summonerData?.puuid,
      );

      return {
        myTeam: inTeamOne
          ? (matchData?.gameData.teamOne ?? [])
          : (matchData?.gameData.teamTwo ?? []),
        theirTeam: inTeamOne
          ? (matchData?.gameData.teamTwo ?? [])
          : (matchData?.gameData.teamOne ?? []),
      };
    }
  }, [matchData, champSelectSession]);

  const playerTeamColor = useMemo(() => {
    const result = new Map<string, CSSProperties>();
    if (!matchData) return result;

    const players = [
      ...matchData.gameData.teamOne,
      ...matchData.gameData.teamTwo,
    ];
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

    teamPlayers.forEach((players) => {
      if (players.length >= 2) {
        players.forEach((puuid) => {
          result.set(puuid, {
            borderColor: colors[colorIndex],
          });
        });
        colorIndex++;
      }
    });

    return result;
  }, [matchData]);

  if (myTeam.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full w-full">
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
            {theirTeam.map((player) => (
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
