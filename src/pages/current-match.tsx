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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/tailwind";

export function CurrentMatch() {
  const { t } = useI18n();

  const gameFlowPhaseFromEvent = useLcuEvent("lol-gameflow_v1_gameflow-phase");
  const { data: gameFlowPhaseFromApi, run: refetchGameFlowPhase } = useLcuApi(
    "/lol-gameflow/v1/gameflow-phase",
  );
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
          {t["page.current-match.waiting-for-match-to-start"]()}
        </div>
        <Button
          onClick={refetchGameFlowPhase}
          className="cursor-pointer"
          variant="ghost"
          size="icon"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-6 flex items-center justify-between md:mb-8">
        <h2 className="text-3xl font-extrabold">
          {t["page.current-match.title"]?.() || "当前对局"}
        </h2>
        <Button
          onClick={refetchGameFlowPhase}
          className="cursor-pointer"
          variant="ghost"
          size="icon"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex flex-row justify-center gap-4">
        <Team team="blue" players={myTeam} colors={playerTeamColor} />
        <Separator orientation="vertical" />
        <Team team="red" players={theirTeam} colors={playerTeamColor} />
      </div>
    </div>
  );
}

function Team({
  team,
  players,
  colors,
}: {
  team: "blue" | "red";
  players: {
    puuid: string;
    championId: number;
  }[];
  colors: Map<string, CSSProperties>;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col items-stretch gap-4">
      <div className="flex items-center gap-2">
        <span
          className={cn("inline-block h-6 w-2 rounded", {
            "bg-red-500": team === "red",
            "bg-blue-500": team === "blue",
          })}
        ></span>
        <h3
          className={cn("text-xl font-bold", {
            "text-red-500": team === "red",
            "text-blue-500": team === "blue",
          })}
        >
          {t[`page.current-match.${team}`]()}
        </h3>
      </div>
      {players.map((player) => (
        <PlayerCard
          style={colors.get(player.puuid)}
          key={player.puuid}
          championId={player.championId}
          puuid={player.puuid}
        />
      ))}
    </div>
  );
}
