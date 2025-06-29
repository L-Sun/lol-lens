import { RefreshCw, Settings, Shield, Sword, Target, Zap } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n, useLcuEvent } from "@/hooks";
import { EventPayload } from "@/lcu/events";

// 英雄头像组件
const ChampionAvatar = ({
  championId,
  size = "md",
}: {
  championId: number;
  size?: "sm" | "md" | "lg";
}) => {
  const { t } = useI18n();
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={`${sizeClasses[size]} cursor-pointer transition-transform hover:scale-105`}
        >
          <AvatarImage
            src={`/api/champion/${championId}/icon`}
            alt={`Champion ${championId}`}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs">
            {championId || "?"}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {t["page.current-match.champion-id"]()}:{" "}
          {championId || t["page.current-match.unknown"]()}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

// 召唤师技能组件
const SummonerSpellAvatar = ({
  spellId,
  size = "sm",
}: {
  spellId: number;
  size?: "sm" | "md";
}) => {
  const { t } = useI18n();
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={`${sizeClasses[size]} cursor-pointer transition-transform hover:scale-105`}
        >
          <AvatarImage
            src={`/api/summoner-spell/${spellId}/icon`}
            alt={`Spell ${spellId}`}
          />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-xs">
            {spellId || "?"}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {t["page.current-match.summoner-spell-id"]()}:{" "}
          {spellId || t["page.current-match.unknown"]()}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

// 符文组件
const RuneAvatar = ({
  runeId,
  size = "sm",
}: {
  runeId: number;
  size?: "sm" | "md";
}) => {
  const { t } = useI18n();
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={`${sizeClasses[size]} cursor-pointer transition-transform hover:scale-105`}
        >
          <AvatarImage
            src={`/api/rune/${runeId}/icon`}
            alt={`Rune ${runeId}`}
          />
          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-yellow-600 text-white font-bold text-xs">
            {runeId || "?"}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {t["page.current-match.rune-id"]()}:{" "}
          {runeId || t["page.current-match.unknown"]()}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

// 定义玩家类型
type Player = EventPayload<"lol-gameflow_v1_session">["gameData"]["teamOne"][0];

// 玩家卡片组件
const PlayerCard = ({
  player,
  isBlueTeam = false,
  position = "Unknown",
}: {
  player: Player;
  isBlueTeam?: boolean;
  position?: string;
}) => {
  const { t } = useI18n();

  const getPositionIcon = (pos: string) => {
    switch (pos) {
      case "Top":
        return <Sword className="w-3 h-3" />;
      case "Jungle":
        return <Target className="w-3 h-3" />;
      case "Mid":
        return <Zap className="w-3 h-3" />;
      case "ADC":
        return <Target className="w-3 h-3" />;
      case "Support":
        return <Shield className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getPositionText = (pos: string) => {
    switch (pos) {
      case "Top":
        return t["page.current-match.position-top"]();
      case "Jungle":
        return t["page.current-match.position-jungle"]();
      case "Mid":
        return t["page.current-match.position-mid"]();
      case "ADC":
        return t["page.current-match.position-adc"]();
      case "Support":
        return t["page.current-match.position-support"]();
      default:
        return pos;
    }
  };

  return (
    <Card
      className={`${
        isBlueTeam
          ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50/70"
          : "border-red-200 bg-red-50/50 hover:bg-red-50/70"
      } transition-colors`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* 英雄头像 */}
          <ChampionAvatar championId={player.championId} size="md" />

          <div className="flex-1 min-w-0">
            {/* 玩家信息 */}
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs">?</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm truncate">
                Player {player.summonerId}
              </span>
              <Badge variant="outline" className="text-xs">
                {getPositionIcon(position)}
                {getPositionText(position)}
              </Badge>
            </div>

            {/* 召唤师技能 */}
            <div className="flex items-center gap-1 mb-2">
              <SummonerSpellAvatar spellId={0} />
              <SummonerSpellAvatar spellId={0} />
            </div>

            {/* 符文 */}
            <div className="flex items-center gap-1">
              <RuneAvatar runeId={0} />
              <span className="text-xs text-muted-foreground">
                {t["page.current-match.primary-rune"]()}
              </span>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={isBlueTeam ? "default" : "destructive"}
              className="text-xs"
            >
              {t["page.current-match.status-ready"]()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 队伍组件
const TeamSection = ({
  players,
  teamName,
  isBlueTeam = false,
}: {
  players: Player[];
  teamName: string;
  isBlueTeam?: boolean;
}) => {
  const { t } = useI18n();
  const positions = ["Top", "Jungle", "Mid", "ADC", "Support"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-4 h-4 rounded-full ${
            isBlueTeam ? "bg-blue-500" : "bg-red-500"
          }`}
        />
        <h3
          className={`font-semibold ${
            isBlueTeam ? "text-blue-700" : "text-red-700"
          }`}
        >
          {teamName}
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {players.length} {t["page.current-match.players-count"]()}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-2">
        {players.map((player, index) => (
          <PlayerCard
            key={player.puuid}
            player={player}
            isBlueTeam={isBlueTeam}
            position={positions[index] || "Unknown"}
          />
        ))}
      </div>
    </div>
  );
};

// 统计卡片组件
const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "secondary" | "destructive";
}) => {
  const variantClasses = {
    default: "bg-primary/10 border-primary/20",
    secondary: "bg-secondary/10 border-secondary/20",
    destructive: "bg-destructive/10 border-destructive/20",
  };

  return (
    <Card
      className={`${variantClasses[variant]} transition-colors hover:bg-opacity-20`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
          <div className="flex-1">
            <div className="text-lg font-semibold">{value}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function CurrentMatch() {
  const { t } = useI18n();
  const match = useLcuEvent("lol-gameflow_v1_session");

  // 如果没有对局数据，显示等待状态
  if (!match) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="w-5 h-5" />
              {t["page.current-match.title"]()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Avatar className="w-16 h-16 mx-auto mb-4">
                <AvatarFallback className="bg-muted">
                  <Sword className="w-8 h-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold mb-2">
                {t["page.current-match.waiting"]()}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t["page.current-match.connecting"]()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { gameData } = match;
  const { teamOne, teamTwo } = gameData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sword className="w-6 h-6" />
            {t["page.current-match.title"]()}
          </h1>
          <p className="text-muted-foreground">
            {t["page.current-match.subtitle"]()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t["page.current-match.refresh"]()}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            {t["page.current-match.settings"]()}
          </Button>
        </div>
      </div>

      <Separator />

      {/* 对局信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>{t["page.current-match.match-details"]()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title={t["page.current-match.blue-players"]()}
              value={teamOne.length}
              icon={Shield}
              variant="default"
            />
            <StatCard
              title={t["page.current-match.red-players"]()}
              value={teamTwo.length}
              icon={Sword}
              variant="destructive"
            />
            <StatCard
              title={t["page.current-match.match-mode"]()}
              value="5v5"
              icon={Target}
              variant="secondary"
            />
          </div>
        </CardContent>
      </Card>

      {/* 队伍信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 蓝队 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full" />
              {t["page.current-match.blue-team"]()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamSection
              players={teamOne}
              teamName={t["page.current-match.blue-team"]()}
              isBlueTeam={true}
            />
          </CardContent>
        </Card>

        {/* 红队 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              {t["page.current-match.red-team"]()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamSection
              players={teamTwo}
              teamName={t["page.current-match.red-team"]()}
              isBlueTeam={false}
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* 对局统计 */}
      <Card>
        <CardHeader>
          <CardTitle>{t["page.current-match.match-stats"]()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title={t["page.current-match.game-duration"]()}
              value="--"
              icon={Target}
            />
            <StatCard
              title={t["page.current-match.map"]()}
              value="--"
              icon={Shield}
            />
            <StatCard
              title={t["page.current-match.game-mode"]()}
              value="--"
              icon={Zap}
            />
            <StatCard
              title={t["page.current-match.status"]()}
              value={t["page.current-match.status-ready"]()}
              icon={Sword}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
