import { z } from "zod";

import { gameSessionSchema, jsonSchema } from "@/lcu/types";

export const eventSchemas = {
  "": jsonSchema,
  "lol-gameflow_v1_session": gameSessionSchema.partial(),
} as const;

export type EventName = keyof typeof eventSchemas;
export type EventPayload<E extends EventName> = z.infer<
  (typeof eventSchemas)[E]
>;

export function getEventSchema(event: string) {
  return z.object({
    eventType: z.enum(["Update"]),
    data: event in eventSchemas ? eventSchemas[event as EventName] : jsonSchema,
    uri: z.string(),
  });
}
