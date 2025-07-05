import ReactJsonView from "@microlink/react-json-view";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLcuApi } from "@/hooks";

export function LcuApiTester() {
  const [endpoint, setEndpoint] = useState("/lol-summoner/v1/current-summoner");

  // @ts-expect-error: Allow using a string for the endpoint
  const { data, error, loading, run } = useLcuApi(endpoint, {
    hookOptions: {
      manual: true,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="e.g. /lol-summoner/v1/current-summoner"
        />
        <Button onClick={() => run()} disabled={loading}>
          {loading ? "Loading..." : "Send"}
        </Button>
      </div>
      <div>
        {error && <p className="text-destructive">{error.message}</p>}
        {data &&
          (typeof data === "object" ? (
            <div className="rounded-lg bg-muted p-4">
              <ReactJsonView
                src={data}
                theme="ocean"
                style={{ background: "transparent" }}
                collapsed={true}
              />
            </div>
          ) : (
            <pre className="rounded-lg bg-muted p-4">{String(data)}</pre>
          ))}
      </div>
    </div>
  );
}
