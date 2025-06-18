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
