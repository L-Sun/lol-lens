import { z } from "zod";

export const LcuInfoSchema = z.object({
  token: z.string(),
  port: z.string(),
});
export type LcuInfo = z.infer<typeof LcuInfoSchema>;

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
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

export const summonerSchema = z.object({
  gameName: z.string(),
  privacy: z.string(),
  profileIconId: z.number(),
  summonerId: z.number(),
  summonerLevel: z.number(),
  tagLine: z.string(),
});

export const endpointSchemas = {
  "/help": jsonSchema,
  "/lol-summoner/v1/current-summoner": summonerSchema,
} as const;

export type Endpoint = keyof typeof endpointSchemas;
export type EndpointSchema<E extends Endpoint> = z.infer<
  (typeof endpointSchemas)[E]
>;
