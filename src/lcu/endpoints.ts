import { z } from "zod";
import { compile as _compile } from "path-to-regexp";

import {
  jsonSchema,
  matchesSchema,
  summonerSchema,
  summonerStatusSchema,
} from "@/lcu/types";

type Endpoint<
  P extends string,
  ReturnSchema extends z.ZodTypeAny,
  QuerySchema extends z.ZodTypeAny
> = {
  method: "GET" | "POST";
  path: P;
  returnSchema: ReturnSchema;
  paramsSchema?: QuerySchema;
};

class EndpointBuilder<T extends {} = {}> {
  private endpoints: T = {} as T;

  constructor() {}

  add<
    P extends string,
    ReturnSchema extends z.ZodTypeAny,
    QuerySchema extends z.ZodTypeAny
  >(
    method: "GET" | "POST",
    path: P,
    returnSchema: ReturnSchema,
    paramsSchema?: QuerySchema
  ) {
    const endpoint = {
      method,
      path,
      returnSchema,
      paramsSchema,
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
    matchesSchema
  )
  .add(
    "GET",
    "/lol-match-history/v1/products/lol/:puuid/matches",
    matchesSchema
  )
  .add("GET", "/lol-summoner/v1/current-summoner", summonerSchema)
  .build();

export type Endpoints = keyof typeof endpoints;
export type EndpointReturnType<E extends Endpoints> = z.infer<
  (typeof endpoints)[E]["returnSchema"]
>;
export type EndpointParams<E extends Endpoints> = z.infer<
  NonNullable<(typeof endpoints)[E]["paramsSchema"]>
>;
