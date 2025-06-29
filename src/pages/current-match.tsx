import { RefreshCw, Settings, Shield, Sword, Target, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLcuEvent } from "@/hooks";
import { EventPayload } from "@/lcu/events";

// 占位符组件
const PlaceholderIcon = ({ className }: { className?: string }) => (
  <div
    className={`bg-muted rounded-full flex items-center justify-center ${className}`}
  >
    <span className="text-xs text-muted-foreground">?</span>
  </div>
);

// 英雄头像组件
const ChampionIcon = ({
  championId,
  size = "md",
}: {
  championId: number;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-transform hover:scale-105`}
        >
          {championId || "?"}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>英雄 ID: {championId || "未知"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// 召唤师技能组件
const SummonerSpell = ({
  spellId,
  size = "sm",
}: {
  spellId: number;
  size?: "sm" | "md";
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-transform hover:scale-105`}
        >
          {spellId || "?"}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>召唤师技能 ID: {spellId || "未知"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// 符文组件
const RuneIcon = ({
  runeId,
  size = "sm",
}: {
  runeId: number;
  size?: "sm" | "md";
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`${sizeClasses[size]} bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer transition-transform hover:scale-105`}
        >
          {runeId || "?"}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>符文 ID: {runeId || "未知"}</p>
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
          <ChampionIcon championId={player.championId} size="md" />

          <div className="flex-1 min-w-0">
            {/* 玩家信息 */}
            <div className="flex items-center gap-2 mb-2">
              <PlaceholderIcon className="w-5 h-5" />
              <span className="font-medium text-sm truncate">
                Player {player.summonerId}
              </span>
              <Badge variant="outline" className="text-xs">
                {getPositionIcon(position)}
                {position}
              </Badge>
            </div>

            {/* 召唤师技能 */}
            <div className="flex items-center gap-1 mb-2">
              <SummonerSpell spellId={0} />
              <SummonerSpell spellId={0} />
            </div>

            {/* 符文 */}
            <div className="flex items-center gap-1">
              <RuneIcon runeId={0} />
              <span className="text-xs text-muted-foreground">
                Primary Rune
              </span>
            </div>
          </div>

          {/* 状态指示器 */}
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={isBlueTeam ? "default" : "destructive"}
              className="text-xs"
            >
              Ready
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
          {players.length} 人
        </Badge>
      </div>

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
  const match = useLcuEvent("lol-gameflow_v1_session");

  // 如果没有对局数据，显示等待状态
  if (!match) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="w-5 h-5" />
              当前对局
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Sword className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">等待对局开始</h3>
              <p className="text-muted-foreground mb-4">
                正在连接到英雄联盟客户端...
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
            当前对局
          </h1>
          <p className="text-muted-foreground">实时对局信息</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      {/* 对局信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>对局详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="蓝队玩家"
              value={teamOne.length}
              icon={Shield}
              variant="default"
            />
            <StatCard
              title="红队玩家"
              value={teamTwo.length}
              icon={Sword}
              variant="destructive"
            />
            <StatCard
              title="对局模式"
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
              蓝队
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamSection players={teamOne} teamName="蓝队" isBlueTeam={true} />
          </CardContent>
        </Card>

        {/* 红队 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              红队
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamSection players={teamTwo} teamName="红队" isBlueTeam={false} />
          </CardContent>
        </Card>
      </div>

      {/* 对局统计 */}
      <Card>
        <CardHeader>
          <CardTitle>对局统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="游戏时长" value="--" icon={Target} />
            <StatCard title="地图" value="--" icon={Shield} />
            <StatCard title="游戏模式" value="--" icon={Zap} />
            <StatCard title="状态" value="准备中" icon={Sword} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
