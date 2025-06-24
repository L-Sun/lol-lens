import { match } from "path-to-regexp";
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
  bans: z.array(z.number().int()),
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

export const endpointSchemas = {
  "/help": jsonSchema,
  "/lol-summoner/v1/current-summoner": summonerSchema,
  "/lol-summoner/v1/status": summonerStatusSchema,
  "/lol-summoner/v1/summoners/{id}": summonerSchema,
  "/lol-summoner/v2/summoners/puuid/{puuid}": summonerSchema,
  "/lol-match-history/v1/products/lol/current-summoner/matches": matchesSchema,
} as const;
type _Endpoint = keyof typeof endpointSchemas;

type ExtractMatcher<T> = T extends `${string}{${string}}${string}` ? T : never;
type ExcludeMatcher<T> = T extends `${string}{${string}}${string}` ? never : T;
type NoSlash<T extends string> = T extends `${string}/${string}` ? never : T;

type ToDynamicPath<T extends string> =
  T extends `${infer Start}/{${infer Param}}${infer End}`
    ? Param extends NoSlash<Param>
      ? `${Start}/${NoSlash<string>}${ToDynamicPath<End>}`
      : never
    : T;

export type DynamicEndpoint = ToDynamicPath<ExtractMatcher<_Endpoint>>;
export type StaticEndpoint = ExcludeMatcher<_Endpoint>;
export type Endpoint = StaticEndpoint | DynamicEndpoint;

type MatcherToDynamicMap = {
  [Key in ExtractMatcher<_Endpoint> as ToDynamicPath<Key>]: Key;
};

export type EndpointSchema<E extends Endpoint> =
  (typeof endpointSchemas)[E extends DynamicEndpoint
    ? MatcherToDynamicMap[E]
    : E];

export type EndpointReturnType<E extends Endpoint> = z.infer<EndpointSchema<E>>;

const matcherRegex = /\{[^}]+\}/g;
const matchers = new Map(
  Object.entries(endpointSchemas)
    .filter(([endpoint]) => matcherRegex.test(endpoint))
    .map(([endpoint, schema]) => {
      const matcher = match(endpoint.replace(matcherRegex, ":$1"));
      return [matcher, schema] as [
        typeof matcher,
        EndpointSchema<DynamicEndpoint>
      ];
    })
);

function isStaticEndpoint(endpoint: string): endpoint is StaticEndpoint {
  return !matcherRegex.test(endpoint) && endpoint in endpointSchemas;
}

export function getEndpointSchema<E extends Endpoint>(
  endpoint: E
): EndpointSchema<E> | null;

export function getEndpointSchema(endpoint: string): unknown;

export function getEndpointSchema(endpoint: string) {
  if (isStaticEndpoint(endpoint)) {
    return endpointSchemas[endpoint];
  }

  for (const [matcher, schema] of matchers) {
    if (matcher(endpoint)) return schema;
  }

  return null;
}
