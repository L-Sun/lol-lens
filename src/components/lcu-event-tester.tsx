import ReactJsonView from "@microlink/react-json-view";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLcuEvent } from "@/hooks";
import { EventName } from "@/lcu/events";

interface EventData {
  event: string;
  timestamp: number;
  data: unknown;
}

export function LcuEventTester() {
  const [eventName, setEventName] = useState("lol-gameflow_v1_session");
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventData[]>([]);

  const handleRegisterEvent = () => {
    if (!eventName.trim()) return;
    setCurrentEvent(eventName.trim());
    setEventName("");
  };

  const handleUnregisterEvent = () => {
    setCurrentEvent(null);
  };

  const handleEventData = useCallback(
    (data: unknown) => {
      if (!currentEvent) return;
      setEventData((prev) => [
        {
          event: currentEvent,
          timestamp: Date.now(),
          data,
        },
        ...prev.slice(0, 99), // 保留最近100条记录
      ]);
    },
    [currentEvent]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="e.g. lol-gameflow_v1_session"
          onKeyDown={(e) => e.key === "Enter" && handleRegisterEvent()}
        />
        <Button onClick={handleRegisterEvent} disabled={!!currentEvent}>
          Register
        </Button>
      </div>

      {currentEvent && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Current Event:</p>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
            <span className="text-sm font-mono">{currentEvent}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnregisterEvent}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      )}

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

      {currentEvent && (
        <EventSubscription event={currentEvent} onData={handleEventData} />
      )}
    </div>
  );
}

interface EventSubscriptionProps {
  event: string;
  onData: (data: unknown) => void;
}

function EventSubscription({ event, onData }: EventSubscriptionProps) {
  const data = useLcuEvent(event as EventName);
  useEffect(() => {
    if (data) {
      onData(data);
    }
  }, [data, onData]);
  return null;
}
