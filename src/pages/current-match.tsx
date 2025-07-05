import { PlayerCard } from "@/components/player-card";
import { mockData } from "@/lcu/mock-data";

export function CurrentMatch() {
  const allPlayers = [
    ...mockData.gameData.teamOne,
    ...mockData.gameData.teamTwo,
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">当前对局</h2>
      <div className="grid grid-cols-2 gap-4">
        {allPlayers.map((player) => (
          <PlayerCard key={player.puuid} puuid={player.puuid} />
        ))}
      </div>
    </div>
  );
}
