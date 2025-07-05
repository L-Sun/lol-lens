import { PlayerCard } from "@/components/player-card";
import { gameSessionSchema } from "@/lcu/types";

const mockData = gameSessionSchema.parse({
  gameData: {
    teamOne: [
      {
        championId: 85,
        profileIconId: 6893,
        summonerId: 2937746141,
        puuid: "4db3f4c5-d5e9-5a8b-bfa0-61b95b2a799a",
      },
      {
        championId: 235,
        profileIconId: 5067,
        summonerId: 2936439199,
        puuid: "fb0e2817-2519-5bb3-b829-1f7aeb7ef832",
      },
      {
        championId: 59,
        profileIconId: 21,
        summonerId: 2978755358,
        puuid: "01d9eb97-aa18-55fe-847b-01bfcd015edd",
      },
      {
        championId: 74,
        profileIconId: 606,
        summonerId: 2289556443277280,
        puuid: "63d451c7-e4dd-5cd4-a2a3-dea6b8f35f20",
      },
      {
        championId: 126,
        profileIconId: 782,
        summonerId: 4134186159,
        puuid: "14306db2-d780-5e17-bf9f-38ff664d88fa",
      },
    ],
    teamTwo: [
      {
        championId: 901,
        profileIconId: 4918,
        summonerId: 4134995261,
        puuid: "4db3f4c5-d5e9-5a8b-bfa0-61b95b2a799a",
      },
      {
        championId: 202,
        profileIconId: 6341,
        summonerId: 4010495953,
        puuid: "ee4dc623-0b27-5b28-a299-5540ccd68e33",
      },
      {
        championId: 39,
        profileIconId: 4856,
        summonerId: 4133384159,
        puuid: "9988d2e4-891d-5da8-b02f-3d6a853a1c4f",
      },
      {
        championId: 43,
        profileIconId: 3018,
        summonerId: 2820776575297792,
        puuid: "cfe93688-c02f-5cca-8bfc-9e057b3070d3",
      },
      {
        championId: 78,
        profileIconId: 914,
        summonerId: 2329018088443424,
        puuid: "82818068-3e4d-5a42-94ec-0ef996aae2a9",
      },
    ],
  },
});

export function CurrentMatch() {
  return <PlayerCard puuid={mockData.gameData.teamOne[0].puuid} />;
}
