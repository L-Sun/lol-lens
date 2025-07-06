import ReactJsonView from "@microlink/react-json-view";
import { useRequest } from "ahooks";
import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetch } from "@/lcu/fetch";
import { LcuInfoContext } from "@/lcu/provider";
import { jsonSchema } from "@/lcu/types";

export function LcuApiTester() {
  const [endpoint, setEndpoint] = useState("/lol-summoner/v1/current-summoner");
  const info = useContext(LcuInfoContext);

  const { data, error, loading, run } = useRequest(
    async () => {
      if (!info.running) return;
      const response = await fetch(endpoint, info);

      return jsonSchema.parse(await response.json());
    },
    {
      manual: true,
    }
  );

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
