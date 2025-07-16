import { PlayerCard } from "@/components/player/player-card";
import { useI18n, useLcuEvent } from "@/hooks";

export function CurrentMatch() {
  const matchData = useLcuEvent("lol-gameflow_v1_session");
  const { t } = useI18n();

  console.log(matchData);

  if (
    !matchData ||
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

  const { teamOne, teamTwo } = matchData.gameData;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">当前对局</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-600">蓝队</h3>
          <div className="space-y-3">
            {teamOne.map((player) => (
              <PlayerCard
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
            {teamTwo.map((player) => (
              <PlayerCard
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
