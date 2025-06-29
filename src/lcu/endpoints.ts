import { match } from "path-to-regexp";
import { z } from "zod";

import {
  jsonSchema,
  matchesSchema,
  summonerSchema,
  summonerStatusSchema,
} from "@/lcu/types";

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
