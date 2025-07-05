import WebSocket from "@tauri-apps/plugin-websocket";
import { noop, Subject } from "rxjs";

import { EventName, EventPayload, getEventSchema } from "@/lcu/events";
import { DisposableGroup } from "@/utils";

import { EndpointReturnType, Endpoints, endpoints } from "./endpoints";
import {
  jsonSchema,
  LcuMessage,
  LcuMessageSchema,
  LcuMessageType,
  LcuPortToken,
} from "./types";

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
    ((data: EventPayload<EventName>) => void)[]
  >();
  private disconnected = false;
  private readonly disposables = new DisposableGroup();
  private readonly callResultSubject = new Subject<CallResult>();

  private constructor(private readonly ws: WebSocket) {
    const listener = this.ws.addListener((message) => {
      if (message.type === "Text") {
        if (message.data.length === 0) return;

        let data: LcuMessage;
        try {
          data = LcuMessageSchema.parse(JSON.parse(message.data));
        } catch (e) {
          console.error("Failed to parse message", message.data);
          console.error(e);
          return;
        }

        const [type, ...payload] = data;
        switch (type) {
          case LcuMessageType.WELCOME:
            console.log("Welcome to the LCU", payload);
            break;
          case LcuMessageType.PREFIX:
            console.log("Prefix", payload);
            break;
          case LcuMessageType.CALL:
            console.log("Call", payload);
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
            console.log("Subscribe", payload);
            break;
          case LcuMessageType.UNSUBSCRIBE:
            console.log("Unsubscribe", payload);
            break;
          case LcuMessageType.PUBLISH:
            console.log("Publish", payload);
            break;
          case LcuMessageType.EVENT:
            {
              const [topic, eventData] = payload as [string, string];
              const eventName = topic.replace(
                "OnJsonApiEvent_",
                ""
              ) as EventName;
              const schema = getEventSchema(eventName);
              const parseResult = schema.safeParse(eventData);
              const data = parseResult.success
                ? parseResult.data.data
                : jsonSchema.parse(eventData);
              this.subscriptions.get(eventName)?.forEach((cb) => cb(data));
            }
            break;
          default:
            console.log("Unknown message type", type);
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
      })
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
    callback: (data: EventPayload<E>) => void
  ): () => void {
    if (event.length === 0 || this.disconnected) return noop;

    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, [callback]);
      this.ws
        .send(
          JSON.stringify([LcuMessageType.SUBSCRIBE, `OnJsonApiEvent_${event}`])
        )
        .catch(console.error);
    } else {
      this.subscriptions.get(event)?.push(callback);
    }

    return () => {
      if (this.disconnected) return;
      const callbacks = this.subscriptions.get(event);
      if (!callbacks) {
        throw new Error(`Subscription for ${event} not found`);
      }
      callbacks.splice(callbacks.indexOf(callback), 1);

      if (callbacks.length === 0) {
        this.ws
          .send(JSON.stringify([LcuMessageType.UNSUBSCRIBE, event]))
          .catch(console.error);
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
                })
              );
            }
            subscription.unsubscribe();
          }
        }
      );
    });

    await this.ws.send(
      JSON.stringify([LcuMessageType.CALL, requestId, endpoint])
    );

    return result;
  }
}
