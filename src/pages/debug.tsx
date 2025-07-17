import { LcuApiTester } from "@/components/lcu-api-tester";
import { LcuEventTester } from "@/components/lcu-event-tester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Debug() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>LCU API Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <LcuApiTester />
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
