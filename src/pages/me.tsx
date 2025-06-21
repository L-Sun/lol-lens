import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n";

export function Me() {
  const { t } = useI18n();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>{t["page.me.title"]()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t["page.me.description"]()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
