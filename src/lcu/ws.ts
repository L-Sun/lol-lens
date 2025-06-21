import WebSocket from "@tauri-apps/plugin-websocket";
import { noop, Subject } from "rxjs";

import { DisposableGroup } from "@/utils";

import {
  Endpoint,
  EndpointSchema,
  endpointSchemas,
  LcuInfo,
  LcuMessage,
  LcuMessageSchema,
  LcuMessageType,
} from "./types";

type CallResult = {
  requestId: string;
} & (
  | {
      status: "success";
      result: unknown;
    }
  | {
      status: "error";
      result: { errorType: string; message: string };
    }
);

export class LcuWebSocket {
  private readonly subscriptions = new Map<
    string,
    ((data: unknown) => void)[]
  >();

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
                result,
              });
            }
            break;
          case LcuMessageType.CALLERROR:
            {
              const [requestId, errorType, message] = payload as string[];
              this.callResultSubject.next({
                requestId,
                status: "error",
                result: { errorType, message },
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
              const [topic, eventData] = payload as [string, unknown];
              this.subscriptions.get(topic)?.forEach((cb) => cb(eventData));
            }
            break;
          default:
            console.log("Unknown message type", type);
        }
      }
    });

    this.disposables.add(listener);
  }

  static async connect(info: LcuInfo) {
    return new LcuWebSocket(
      await WebSocket.connect(`wss://127.0.0.1:${info.port}`, {
        headers: {
          Authorization: `Basic ${info.token}`,
        },
      })
    );
  }

  close() {
    this.ws.disconnect().catch(console.error);
  }

  subscribe(event: string, callback: (data: unknown) => void): () => void {
    if (event.length === 0) return noop;

    if (!this.subscriptions.has(event)) {
      this.ws
        .send(JSON.stringify([LcuMessageType.SUBSCRIBE, event]))
        .catch(console.error);
      this.subscriptions.set(event, [callback]);
    } else {
      this.subscriptions.get(event)?.push(callback);
    }

    return () => {
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

  async call(endpoint: Endpoint): Promise<EndpointSchema<Endpoint>>;
  async call(endpoint: string): Promise<unknown>;

  async call(endpoint: string): Promise<unknown> {
    const requestId = Math.random().toString(36).substring(2, 15);

    const result = new Promise((resolve, reject) => {
      const subscription = this.callResultSubject.subscribe(
        ({ requestId: resultRequestId, result, status }) => {
          if (requestId === resultRequestId) {
            if (status === "success") {
              if (endpoint in endpointSchemas) {
                resolve(endpointSchemas[endpoint as Endpoint].parse(result));
              } else {
                resolve(result);
              }
            } else {
              reject(
                new Error(result.errorType, {
                  cause: result.message,
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
