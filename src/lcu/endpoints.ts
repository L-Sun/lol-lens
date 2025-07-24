import { z } from "zod";

import {
  assetItemSchema,
  blobSchema,
  championSelectSessionSchema,
  cherryAugmentSchema,
  gameFlowPhaseSchema,
  gameSchema,
  gameSessionSchema,
  jsonSchema,
  matchesSchema,
  perkSchema,
  perkStyleSchema,
  spellSchema,
  summonerSchema,
  summonerStatusSchema,
} from "@/lcu/types";

type Endpoint<
  P extends string,
  ReturnSchema extends z.ZodTypeAny,
  QuerySchema extends z.ZodTypeAny,
> = {
  method: "GET" | "POST";
  path: P;
  returnSchema: ReturnSchema;
  querySchema?: QuerySchema;
};

class EndpointBuilder<T extends object = object> {
  private endpoints: T = {} as T;

  constructor() {}

  add<
    P extends string,
    ReturnSchema extends z.ZodTypeAny,
    QuerySchema extends z.ZodTypeAny,
  >(
    method: "GET" | "POST",
    path: P,
    returnSchema: ReturnSchema,
    querySchema?: QuerySchema,
  ) {
    const endpoint = {
      method,
      path,
      returnSchema,
      querySchema,
    } satisfies Endpoint<P, ReturnSchema, QuerySchema>;

    this.endpoints = {
      ...this.endpoints,
      [path]: endpoint,
    };

    return this as unknown as EndpointBuilder<{
      [K in keyof T | P]: K extends P
        ? typeof endpoint
        : K extends keyof T
          ? T[K]
          : never;
    }>;
  }

  build() {
    return this.endpoints;
  }
}

export const endpoints = new EndpointBuilder()
  .add("GET", "/help", jsonSchema)
  .add("GET", "/lol-summoner/v1/status", summonerStatusSchema)
  .add("GET", "/lol-summoner/v1/summoners/:id", summonerSchema)
  .add("GET", "/lol-summoner/v2/summoners/puuid/:puuid", summonerSchema)
  .add(
    "GET",
    "/lol-match-history/v1/products/lol/current-summoner/matches",
    matchesSchema,
  )
  .add(
    "GET",
    "/lol-match-history/v1/products/lol/:puuid/matches",
    matchesSchema,
    z.object({
      begIndex: z.number().optional(),
      endIndex: z.number().optional(),
    }),
  )
  .add("GET", "/lol-summoner/v1/current-summoner", summonerSchema)
  .add("GET", "/lol-game-data/assets/v1/champion-icons/:id.png", blobSchema)
  .add("GET", "/lol-game-data/assets/v1/profile-icons/:id.jpg", blobSchema)
  .add("GET", "/lol-match-history/v1/games/:gameId", gameSchema)
  .add("GET", "/lol-game-data/assets/v1/items.json", assetItemSchema.array())
  .add(
    "GET",
    "/lol-game-data/assets/v1/summoner-spells.json",
    spellSchema.array(),
  )
  .add(
    "GET",
    "/lol-game-data/assets/v1/perkstyles.json",
    z.object({
      styles: perkStyleSchema.array(),
    }),
  )
  .add("GET", "/lol-game-data/assets/v1/perks.json", perkSchema.array())
  .add(
    "GET",
    "/lol-game-data/assets/v1/cherry-augments.json",
    cherryAugmentSchema.array(),
  )
  .add("GET", "/lol-gameflow/v1/gameflow-phase", jsonSchema)
  .add("GET", "/lol-gameflow/v1/session", gameSessionSchema)
  .add("GET", "/lol-champ-select/v1/session", championSelectSessionSchema)
  .add("GET", "/lol-gameflow/v1/gameflow-phase", gameFlowPhaseSchema)
  .build();

export type Endpoints = keyof typeof endpoints;
export type EndpointReturnType<E extends Endpoints> = z.infer<
  (typeof endpoints)[E]["returnSchema"]
>;
export type EndpointQueryType<E extends Endpoints> = z.infer<
  NonNullable<(typeof endpoints)[E]["querySchema"]>
>;

type ExtractParams<T extends string> =
  T extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${string}/:${infer Param}.${infer _}`
      ? Param
      : T extends `${string}/:${infer Param}`
        ? Param
        : never;

type ParamsToRecord<T extends string> = {
  [K in ExtractParams<T>]: string;
};
export type EndpointParamsType<E extends Endpoints> = ParamsToRecord<E>;
