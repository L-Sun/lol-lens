import { getLogger } from "@logtape/logtape";
import WebSocket from "@tauri-apps/plugin-websocket";
import { noop, Subject } from "rxjs";

import {
  EventName,
  EventPayload,
  eventTypeSchema,
  getEventSchema,
} from "@/lcu/events";
import { DisposableGroup } from "@/utils";

import { EndpointReturnType, Endpoints, endpoints } from "./endpoints";
import {
  jsonSchema,
  LcuMessage,
  LcuMessageSchema,
  LcuMessageType,
  LcuPortToken,
} from "./schemas";
import { z } from "zod";
import { logger } from "./logger";

type CallResult = {
  requestId: string;
} & (
  | {
      status: "success";
      data: unknown;
    }
  | {
      status: "error";
      data: { errorType: string; message: string };
    }
);

export class LcuWebSocket {
  private readonly subscriptions = new Map<
    EventName,
    {
      eventType: z.infer<typeof eventTypeSchema>;
      callback: (data: EventPayload<EventName>) => void;
    }[]
  >();
  private disconnected = false;
  private readonly disposables = new DisposableGroup();
  private readonly callResultSubject = new Subject<CallResult>();

  private constructor(private readonly ws: WebSocket) {
    const listener = this.ws.addListener((message) => {
      const logger = getLogger(["lol-len", "lcu"]);

      if (message.type === "Text") {
        if (message.data.length === 0) return;

        let data: LcuMessage;
        try {
          data = LcuMessageSchema.parse(JSON.parse(message.data));
        } catch (e) {
          logger.error(
            `Failed to parse message: ${message.data}, error: ${
              e instanceof Error ? e.message : String(e)
            }`,
          );
          return;
        }

        const [type, ...payload] = data;
        switch (type) {
          case LcuMessageType.WELCOME:
            logger.trace("Welcome to the LCU {payload}", { payload });
            break;
          case LcuMessageType.PREFIX:
            logger.trace("Prefix {payload}", { payload });
            break;
          case LcuMessageType.CALL:
            logger.trace("Call {payload}", { payload });
            break;
          case LcuMessageType.CALLRESULT:
            {
              const [requestId, result] = payload as [string, unknown];
              this.callResultSubject.next({
                requestId,
                status: "success",
                data: result,
              });
            }
            break;
          case LcuMessageType.CALLERROR:
            {
              const [requestId, errorType, message] = payload as string[];
              this.callResultSubject.next({
                requestId,
                status: "error",
                data: { errorType, message },
              });
            }
            break;
          case LcuMessageType.SUBSCRIBE:
            logger.trace("Subscribe {payload}", { payload });
            break;
          case LcuMessageType.UNSUBSCRIBE:
            logger.trace("Unsubscribe {payload}", { payload });
            break;
          case LcuMessageType.PUBLISH:
            logger.trace("Publish {payload}", { payload });
            break;
          case LcuMessageType.EVENT:
            {
              const [topic, eventData] = payload as [string, string];
              const eventName = topic.replace(
                "OnJsonApiEvent_",
                "",
              ) as EventName;
              logger.trace("Event {eventName} {eventData}", {
                eventName,
                eventData,
              });

              const schema = getEventSchema(eventName);
              const parseResult = schema.safeParse(eventData);
              if (parseResult.error) {
                logger.error("Failed to parse event {eventName} {error}", {
                  eventName,
                  error: parseResult.error,
                });
                return;
              }
              const data = parseResult.data.data;
              this.subscriptions
                .get(eventName)
                ?.filter(
                  ({ eventType }) => eventType === parseResult.data.eventType,
                )
                .forEach(({ callback }) => callback(data));
            }
            break;
          default:
            logger.warn("Unknown message type {type}", { type });
        }
      }
    });

    this.disposables.add(listener);
  }

  static async connect(info: LcuPortToken) {
    return new LcuWebSocket(
      await WebSocket.connect(`wss://127.0.0.1:${info.port}`, {
        headers: {
          Authorization: `Basic ${info.token}`,
        },
      }),
    );
  }

  close() {
    if (this.disconnected) return;
    this.disconnected = true;
    this.callResultSubject.complete();
    this.subscriptions.clear();
    this.disposables[Symbol.dispose]();
    this.ws.disconnect().catch(console.error);
  }

  subscribe<E extends EventName>(
    event: E,
    callback: (data: EventPayload<E>) => void,
    options: {
      eventType: z.infer<typeof eventTypeSchema>;
    } = {
      eventType: "Update",
    },
  ): () => void {
    if (event.length === 0 || this.disconnected) return noop;

    logger.trace("Subscribing to {event}", { event });
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, [
        {
          callback,
          eventType: options.eventType,
        },
      ]);
      this.ws
        .send(
          JSON.stringify([LcuMessageType.SUBSCRIBE, `OnJsonApiEvent_${event}`]),
        )
        .catch(() => {
          const logger = getLogger(["lol-len", "lcu"]);
          logger.error("Failed to subscribe to {event}", { event });
        });
    } else {
      this.subscriptions.get(event)?.push({
        callback,
        eventType: options.eventType,
      });
    }

    return () => {
      if (this.disconnected) return;
      const callbacks = this.subscriptions.get(event);
      if (!callbacks) {
        throw new Error(`Subscription for ${event} not found`);
      }
      callbacks.splice(
        callbacks.findIndex(
          ({ callback, eventType }) =>
            callback === callback && eventType === options.eventType,
        ),
        1,
      );
      logger.trace("Unsubscribed from {event}", { event });
      logger.trace("Callbacks length {length}", { length: callbacks.length });

      if (callbacks.length === 0) {
        this.ws.send(
          JSON.stringify([
            LcuMessageType.UNSUBSCRIBE,
            `OnJsonApiEvent_${event}`,
          ]),
        );

        this.subscriptions.delete(event);
      }
    };
  }

  async call<E extends Endpoints>(endpoint: E): Promise<EndpointReturnType<E>> {
    const requestId = Math.random().toString(36).substring(2, 15);

    const result = new Promise<EndpointReturnType<E>>((resolve, reject) => {
      const subscription = this.callResultSubject.subscribe(
        ({ requestId: resultRequestId, data, status }) => {
          if (requestId === resultRequestId) {
            if (status === "success") {
              const schema = endpoints[endpoint].returnSchema ?? jsonSchema;
              resolve(schema.parse(data));
            } else {
              reject(
                new Error(data.errorType, {
                  cause: data.message,
                }),
              );
            }
            subscription.unsubscribe();
          }
        },
      );
    });

    await this.ws.send(
      JSON.stringify([LcuMessageType.CALL, requestId, endpoint]),
    );

    return result;
  }
}
