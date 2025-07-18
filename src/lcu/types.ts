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
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
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
  teamParticipantId: z.number().int(),
});

export const teamSchema = z.object({
  teamId: z.number().int(),
  bans: z.array(
    z.object({
      championId: z.number().int(),
      pickTurn: z.number().int(),
    }),
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

export enum SubteamPlacement {
  First = 0,
  Fir1st = 1,
  Second = 2,
  Third = 3,
  Fourth = 4,
  Fifth = 5,
  Sixth = 6,
  Seventh = 7,
  Eighth = 8,
}

export const participantSchema = z.object({
  participantId: z.number().int(),
  teamId: z.number().int(),
  championId: z.number().int(),
  spell1Id: z.number().int(),
  spell2Id: z.number().int(),
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
    totalHeal: z.number().int(),
    goldEarned: z.number().int(),
    perkPrimaryStyle: z.number().int(),
    perkSubStyle: z.number().int(),
    item0: z.number().int(),
    item1: z.number().int(),
    item2: z.number().int(),
    item3: z.number().int(),
    item4: z.number().int(),
    item5: z.number().int(),
    item6: z.number().int(),
    playerAugment1: z.number().int(),
    playerAugment2: z.number().int(),
    playerAugment3: z.number().int(),
    playerAugment4: z.number().int(),
    playerAugment5: z.number().int(),
    playerAugment6: z.number().int(),
    subteamPlacement: z.nativeEnum(SubteamPlacement),
  }),
});

export const gameModeSchema = z.enum([
  "CLASSIC",
  "CHERRY",
  "TFT",
  "ARAM",
  "URF",
  "NEXUSBLITZ",
]);

export const gameSchema = z.object({
  endOfGameResult: z.string(),
  gameCreationDate: z.coerce.date(),
  gameDuration: z.number().int(),
  gameId: z.number().int(),
  gameMode: gameModeSchema,
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
    playerChampionSelections: z.array(
      z.object({
        championId: z.number().int(),
        puuid: z.string().uuid(),
        selectedSkinIndex: z.number().int(),
        spell1Id: z.number().int(),
        spell2Id: z.number().int(),
      }),
    ),
    teamOne: teamMemberSchema.array(),
    teamTwo: teamMemberSchema.array(),
  }),
  map: z.object({
    gameMode: gameModeSchema,
    gameModeName: z.string(),
  }),
});

export const LcuEventSchema = z.object({
  eventType: z.string(),
  data: gameSessionSchema,
  uri: z.string(),
});

export const assetItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  active: z.boolean(),
  inStore: z.boolean(),
  from: z.array(z.number().int()),
  to: z.array(z.number().int()),
  categories: z.array(z.string()),
  maxStacks: z.number().int(),
  requiredChampion: z.string(),
  requiredAlly: z.string(),
  requiredBuffCurrencyName: z.string(),
  requiredBuffCurrencyCost: z.number().int(),
  specialRecipe: z.number().int(),
  isEnchantment: z.boolean(),
  price: z.number().int(),
  priceTotal: z.number().int(),
  displayInItemSets: z.boolean(),
  iconPath: z.string(),
});

export const perkStyleSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  tooltip: z.string(),
  iconPath: z.string(),
});

export const perkSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  shortDesc: z.string(),
  iconPath: z.string(),
});

export const spellSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  iconPath: z.string(),
  cooldown: z.number().int(),
});

export const cherryAugmentSchema = z.object({
  id: z.number().int(),
  nameTRA: z.string(),
  augmentSmallIconPath: z.string(),
  rarity: z.enum(["kBronze", "kSilver", "kGold", "kPrismatic"]),
});
