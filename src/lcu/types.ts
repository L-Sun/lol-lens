import { z } from "zod";

export const LcuPortTokenSchema = z.object({
  port: z.string(),
  token: z.string(),
});
export type LcuPortToken = z.infer<typeof LcuPortTokenSchema>;

export enum LcuMessageType {
  WELCOME,
  PREFIX,
  CALL,
  CALLRESULT,
  CALLERROR,
  SUBSCRIBE,
  UNSUBSCRIBE,
  PUBLISH,
  EVENT,
}

export const LcuMessageSchema = z
  .tuple([z.nativeEnum(LcuMessageType)])
  .rest(z.unknown());
export type LcuMessage = z.infer<typeof LcuMessageSchema>;

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

export const blobSchema = z.instanceof(Blob);

export const summonerSchema = z.object({
  gameName: z.string(),
  privacy: z.enum(["PUBLIC", "PRIVATE"]),
  profileIconId: z.number().int(),
  summonerId: z.number().int(),
  summonerLevel: z.number().int(),
  tagLine: z.string(),
  puuid: z.string().uuid(),
});

export const summonerStatusSchema = z.object({
  ready: z.boolean(),
});

export const teamMemberSchema = z.object({
  championId: z.number().int(),
  profileIconId: z.number().int(),
  summonerId: z.number().int(),
  puuid: z.string().uuid(),
});

export const teamSchema = z.object({
  bans: z.array(
    z.object({
      championId: z.number().int(),
      pickTurn: z.number().int(),
    })
  ),
  baronKills: z.number().int(),
  dominionVictoryScore: z.number().int(),
  dragonKills: z.number().int(),
  firstBaron: z.boolean(),
  firstBlood: z.boolean(),
  firstDargon: z.boolean(),
  firstInhibitor: z.boolean(),
  towerKills: z.number().int(),
  vilemawKills: z.number().int(),
  win: z.enum(["Win", "Fail"]),
});

export const participantIdentitySchema = z.object({
  participantId: z.number().int(),
  player: summonerSchema
    .pick({
      puuid: true,
      summonerId: true,
      gameName: true,
      tagLine: true,
    })
    .extend({
      profileIcon: z.number().int(),
    }),
});

export const participantSchema = participantIdentitySchema
  .pick({
    participantId: true,
  })
  .extend({
    championId: z.number().int(),
    stats: z.object({
      win: z.boolean(),
      champLevel: z.number().int(),
      kills: z.number().int(),
      deaths: z.number().int(),
      assists: z.number().int(),
      doubleKills: z.number().int(),
      tripleKills: z.number().int(),
      quadraKills: z.number().int(),
      pentaKills: z.number().int(),
      largestMultiKill: z.number().int(),
      totalDamageTaken: z.number().int(),
      totalDamageDealtToChampions: z.number().int(),
      goldEarned: z.number().int(),
      item0: z.number().int(),
      item1: z.number().int(),
      item2: z.number().int(),
      item3: z.number().int(),
      item4: z.number().int(),
      item5: z.number().int(),
      item6: z.number().int(),
    }),
  });

export const gameSchema = z.object({
  endOfGameResult: z.string(),
  gameCreationDate: z.coerce.date(),
  gameDuration: z.number().int(),
  gameId: z.number().int(),
  gameMode: z.string(),
  gameType: z.string(),
  mapId: z.number().int(),
  participantIdentities: z.array(participantIdentitySchema),
  participants: z.array(participantSchema),
  teams: z.array(teamSchema),
});

export const matchesSchema = z.object({
  accountId: z.number().int(),
  games: z.object({
    gameCount: z.number().int(),
    gameIndexBegin: z.number().int(),
    gameIndexEnd: z.number().int(),
    games: z.array(gameSchema),
  }),
});

export const gameSessionSchema = z.object({
  gameData: z.object({
    teamOne: teamMemberSchema.array(),
    teamTwo: teamMemberSchema.array(),
  }),
});

export const LcuEventSchema = z.object({
  eventType: z.string(),
  data: gameSessionSchema,
  uri: z.string(),
});
