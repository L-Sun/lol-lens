import { CSSProperties, useMemo } from "react";

import { PlayerCard } from "@/components/player/player-card";
import {
  useBindTwoDataSources,
  useI18n,
  useLcuApi,
  useLcuEvent,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function CurrentMatch() {
  const { t } = useI18n();

  const gameFlowPhaseFromEvent = useLcuEvent("lol-gameflow_v1_gameflow-phase");
  const {
    data: gameFlowPhaseFromApi,
    loading,
    run: refetchGameFlowPhase,
  } = useLcuApi("/lol-gameflow/v1/gameflow-phase");
  const gameFlowPhase = useBindTwoDataSources(
    gameFlowPhaseFromEvent,
    gameFlowPhaseFromApi,
  );

  const matchDataFromEvent = useLcuEvent("lol-gameflow_v1_session");
  const { data: matchDataFromApi } = useLcuApi("/lol-gameflow/v1/session", {
    hookOptions: {
      ready: gameFlowPhase && gameFlowPhase !== "None",
      refreshDeps: [gameFlowPhase],
    },
  });
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
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="text-muted-foreground text-center text-2xl font-semibold">
          {t["page.current-match.loading"]()}
        </div>
        <Button
          onClick={refetchGameFlowPhase}
          variant="ghost"
          size="icon"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between md:mb-8">
        <h2 className="text-3xl font-extrabold">
          {t["page.current-match.title"]?.() || "当前对局"}
        </h2>
        <Button
          onClick={refetchGameFlowPhase}
          variant="ghost"
          size="icon"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-6 w-2 rounded bg-blue-500"></span>
            <h3 className="text-xl font-bold text-blue-500">
              {t["page.current-match.blue"]?.() || "蓝队"}
            </h3>
          </div>
          <div className="space-y-4 md:space-y-5">
            {myTeam.map((player) => (
              <PlayerCard
                className="rounded-xl bg-[rgba(30,41,59,0.7)] shadow-lg backdrop-blur transition-transform duration-150 hover:scale-[1.03]"
                style={playerTeamColor.get(player.puuid)}
                key={player.puuid}
                championId={player.championId}
                puuid={player.puuid}
              />
            ))}
          </div>
        </div>
        <div className="my-4 flex flex-shrink-0 flex-col items-center justify-center md:mx-2 md:my-0">
          <div className="block h-px w-full bg-slate-700 opacity-30 md:hidden"></div>
          <div className="hidden h-full w-px bg-slate-700 opacity-30 md:block"></div>
        </div>
        <div className="flex-1">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-6 w-2 rounded bg-red-500"></span>
            <h3 className="text-xl font-bold text-red-500">
              {t["page.current-match.red"]?.() || "红队"}
            </h3>
          </div>
          <div className="space-y-4 md:space-y-5">
            {theirTeam.map((player) => (
              <PlayerCard
                className="rounded-xl bg-[rgba(59,30,41,0.7)] shadow-lg backdrop-blur transition-transform duration-150 hover:scale-[1.03]"
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
