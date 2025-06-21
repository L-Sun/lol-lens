import ReactJsonView from "@microlink/react-json-view";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";

export function Debug() {
  const { t } = useI18n();

  const debugData = {
    app: "LOL Lens",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t["page.debug.title"]()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactJsonView src={debugData} />
        </CardContent>
      </Card>
    </div>
  );
}
