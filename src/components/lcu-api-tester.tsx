import ReactJsonView from "@microlink/react-json-view";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLcuApi, useLcuResource } from "@/hooks";

export function LcuApiTester() {
  const [endpoint, setEndpoint] = useState("/lol-summoner/v1/current-summoner");

  // @ts-expect-error: Allow using a string for the endpoint
  const { data, error, loading, run } = useLcuApi(endpoint, {
    manual: true,
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

export function LcuResourceViewer() {
  const [endpoint, setEndpoint] = useState(
    "/lol-game-data/assets/v1/profile-icons/29.jpg"
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data, error, loading, run } = useLcuResource(endpoint, {
    manual: true,
  });

  useEffect(() => {
    if (data) {
      const url = URL.createObjectURL(data);
      setImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setImageUrl(null);
      };
    }
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="e.g. /lol-game-data/assets/v1/profile-icons/29.jpg"
        />
        <Button onClick={() => run()} disabled={loading}>
          {loading ? "Loading..." : "Fetch"}
        </Button>
      </div>
      <div>
        {error && <p className="text-destructive">{error.message}</p>}
        {imageUrl && (
          <img src={imageUrl} alt={endpoint} className="rounded-lg border" />
        )}
      </div>
    </div>
  );
}
