import { EyeOff } from "lucide-react";
import { useLocation, useParams } from "react-router";

import { ProfileIcon } from "@/components/profile-icon";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n, useLcuApi } from "@/hooks";

export function UserInfo() {
  const { pathname } = useLocation();
  const { userId } = useParams();
  const { t } = useI18n();

  const { data, loading, error } = useLcuApi(
    pathname === "/me"
      ? "/lol-summoner/v1/current-summoner"
      : `/lol-summoner/v1/summoners/${userId}`,
    {},
    { loadingDelay: 1000 }
  );

  if (!data || loading || error) {
    const errorMessage = error
      ? t["page.user.error"]()
      : loading
      ? t["page.user.loading"]()
      : pathname === "/me"
      ? t["page.user.lol-not-started"]()
      : t["page.user.user-not-found"]();
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-2xl font-semibold text-muted-foreground text-center">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-12">
        <div className="relative">
          <ProfileIcon
            profileIconId={data.profileIconId}
            className="h-32 w-32"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full bg-card px-4 py-1 text-sm font-semibold shadow-lg flex items-center gap-1">
            {data.privacy === "PRIVATE" && (
              <EyeOff className="mr-1 h-4 w-4 text-muted-foreground" />
            )}
            {data.summonerLevel}
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            {data.gameName}#{data.tagLine}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
