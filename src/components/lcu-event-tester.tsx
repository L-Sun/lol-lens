import ReactJsonView from "@microlink/react-json-view";
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventName, eventSchemas } from "@/lcu/events";
import { LcuWebSocketContext } from "@/lcu/provider";

interface EventData {
  event: string;
  timestamp: number;
  data: z.infer<(typeof eventSchemas)[""]>;
}

export function LcuEventTester() {
  const websocket = useContext(LcuWebSocketContext);
  const [eventName, setEventName] = useState("lol-gameflow_v1_session");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [eventData, setEventData] = useState<EventData[]>([]);

  useEffect(() => {
    if (isSubscribed) {
      const event = eventName.trim() as Extract<EventName, "">;
      const unsubscribe = websocket?.subscribe(event, (data) => {
        setEventData((prev) => [
          { event, timestamp: Date.now(), data },
          ...prev.slice(0, 99),
        ]);
      });
      return () => unsubscribe?.();
    }
  }, [eventName, isSubscribed, websocket]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEventName(e.target.value);
  }, []);

  const handleButtonClick = useCallback(() => {
    setIsSubscribed((prev) => !prev);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={eventName}
          onChange={handleInputChange}
          placeholder="e.g. lol-gameflow_v1_session"
          disabled={isSubscribed}
        />
        <Button onClick={handleButtonClick} className="relative">
          {isSubscribed && (
            <span className="absolute flex size-3 -top-1 -right-1">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex size-full rounded-full bg-sky-500"></span>
            </span>
          )}
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
      </div>

      {eventData.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Event Data ({eventData.length})
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEventData([])}
            >
              Clear
            </Button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eventData.map((item, index) => (
              <div key={index} className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-blue-600">
                    {item.event}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {typeof item.data === "object" && item.data !== null ? (
                  <ReactJsonView
                    src={item.data}
                    theme="ocean"
                    style={{ background: "transparent" }}
                    collapsed={true}
                  />
                ) : (
                  <pre className="text-xs">
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
