import { z } from "zod";

import {
  championSelectSessionSchema,
  gameSessionSchema,
  jsonSchema,
} from "@/lcu/types";

export const eventSchemas = {
  "": jsonSchema,
  "lol-gameflow_v1_session": gameSessionSchema,
  "lol-champ-select_v1_session": championSelectSessionSchema,
} as const;

export type EventName = keyof typeof eventSchemas;
export type EventPayload<E extends EventName> = z.infer<
  (typeof eventSchemas)[E]
>;

export const eventTypeSchema = z.enum(["Create", "Update", "Delete"]);

export function getEventSchema(event: string) {
  return z.object({
    eventType: eventTypeSchema,
    data: event in eventSchemas ? eventSchemas[event as EventName] : jsonSchema,
    uri: z.string(),
  });
}
