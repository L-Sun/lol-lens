import ReactJsonView from "@microlink/react-json-view";
import { useRequest } from "ahooks";
import {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { endpoints } from "@/lcu/endpoints";
import { fetch } from "@/lcu/fetch";
import { LcuInfoContext } from "@/lcu/provider";
import { jsonSchema } from "@/lcu/types";

export function LcuApiTester() {
  const [endpoint, setEndpoint] = useState("/lol-summoner/v1/current-summoner");
  const info = useContext(LcuInfoContext);

  const [imageURL, setImageURL] = useState<string | null>(null);

  const availableEndpoints = Object.keys(endpoints);

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

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setEndpoint(e.target.value);
    },
    [setEndpoint]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={endpoint}
            onChange={handleInputChange}
            placeholder="e.g. /lol-summoner/v1/current-summoner"
          />
          <Select onValueChange={setEndpoint}>
            <SelectTrigger />
            <SelectContent>
              {availableEndpoints.map((ep) => (
                <SelectItem key={ep} value={ep}>
                  {ep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => run()} disabled={loading}>
            {loading ? "Loading..." : "Send"}
          </Button>
        </div>
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
