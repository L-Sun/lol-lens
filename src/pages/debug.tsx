import { LcuApiTester, LcuResourceViewer } from "@/components/lcu-api-tester";
import { LcuEventTester } from "@/components/lcu-event-tester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks";

export function Debug() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t["page.debug.title"]()}</CardTitle>
        </CardHeader>
        <CardContent>
          <LcuApiTester />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>LCU Resource Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <LcuResourceViewer />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>LCU Event Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <LcuEventTester />
        </CardContent>
      </Card>
    </div>
  );
}
