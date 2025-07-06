import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ChampionIcon, ItemIcon } from "@/components/lol-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { gameSchema, participantSchema } from "@/lcu/types";

interface PlayerMatchCardProps {
  gameId: z.infer<typeof gameSchema>["gameId"];
  info: z.infer<typeof participantSchema>;
}

export function PlayerMatchCard({ gameId, info }: PlayerMatchCardProps) {
  const { t } = useTranslation();

  const { championId, stats } = info;
  const { kills, deaths, assists, champLevel, win, goldEarned } = stats;

  // 计算KDA
  const kda =
    deaths === 0 ? kills + assists : ((kills + assists) / deaths).toFixed(1);

  // 装备列表
  const items = [
    stats.item0,
    stats.item1,
    stats.item2,
    stats.item3,
    stats.item4,
    stats.item5,
    stats.item6,
  ].filter((item) => item !== 0);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <ChampionIcon championId={championId} className="h-12 w-12" />
          <div className="flex-1">
            <CardTitle className="text-lg">
              {t("match.champion")} {championId}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={win ? "default" : "destructive"}>
                {win ? t("match.victory") : t("match.defeat")}
              </Badge>
              <Badge variant="outline">
                {t("match.level")} {champLevel}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KDA 统计 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{kills}</div>
            <div className="text-xs text-muted-foreground">
              {t("match.kills")}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{deaths}</div>
            <div className="text-xs text-muted-foreground">
              {t("match.deaths")}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{assists}</div>
            <div className="text-xs text-muted-foreground">
              {t("match.assists")}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Badge variant="secondary" className="text-sm">
            KDA: {kda}
          </Badge>
        </div>

        <Separator />

        {/* 详细统计 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("match.gold")}</span>
              <span className="font-medium">{goldEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("match.damage-dealt")}
              </span>
              <span className="font-medium">
                {stats.totalDamageDealtToChampions.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("match.damage-taken")}
              </span>
              <span className="font-medium">
                {stats.totalDamageTaken.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("match.double-kills")}
              </span>
              <span className="font-medium">{stats.doubleKills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("match.triple-kills")}
              </span>
              <span className="font-medium">{stats.tripleKills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("match.quadra-kills")}
              </span>
              <span className="font-medium">{stats.quadraKills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("match.penta-kills")}
              </span>
              <span className="font-medium">{stats.pentaKills}</span>
            </div>
          </div>
        </div>

        {/* 装备展示 */}
        {items.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="text-sm font-medium mb-2">{t("match.items")}</div>
              <div className="flex gap-2 flex-wrap">
                {items.map((itemId, index) => (
                  <ItemIcon key={index} itemId={itemId} className="size-8" />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
