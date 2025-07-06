import ReactJsonView from "@microlink/react-json-view";
import { useRequest } from "ahooks";
import { useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetch } from "@/lcu/fetch";
import { LcuInfoContext } from "@/lcu/provider";
import { jsonSchema } from "@/lcu/types";

export function LcuApiTester() {
  const [endpoint, setEndpoint] = useState("/lol-summoner/v1/current-summoner");
  const info = useContext(LcuInfoContext);

  const [imageURL, setImageURL] = useState<string | null>(null);

  const { data, error, loading, run } = useRequest(
    async () => {
      if (!info.running) return;
      const response = await fetch(endpoint, info);

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return jsonSchema.parse(await response.json());
      }
      if (contentType?.includes("image")) {
        return response.blob();
      }

      return response.text();
    },
    {
      manual: true,
    }
  );

  useEffect(() => {
    if (data instanceof Blob) {
      setImageURL(URL.createObjectURL(data));
    }
    return () => {
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
    };
  }, [data]);

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
        {data && typeof data === "object" && !(data instanceof Blob) ? (
          <div className="rounded-lg bg-muted p-4">
            <ReactJsonView
              src={data}
              theme="ocean"
              style={{ background: "transparent" }}
              collapsed={true}
            />
          </div>
        ) : typeof data === "string" ? (
          <pre className="rounded-lg bg-muted p-4">{String(data)}</pre>
        ) : imageURL ? (
          <img src={imageURL} alt="image" className="rounded-lg" />
        ) : null}
      </div>
    </div>
  );
}
