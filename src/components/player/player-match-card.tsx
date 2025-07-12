import {
  Coins,
  Flame,
  Handshake,
  HeartPlus,
  ShieldX,
  Skull,
  Sword,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { z } from "zod";

import {
  ChampionIcon,
  CherryAugmentIcon,
  ItemIcon,
  MultiKillIcon,
  PerkIcon,
  SpellIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n, useLcuApiWithCache } from "@/hooks";
import { gameSchema, participantSchema } from "@/lcu/types";

interface PlayerMatchCardProps {
  gameId: z.infer<typeof gameSchema>["gameId"];
  info: z.infer<typeof participantSchema>;
}

export function PlayerMatchCard({ gameId, info }: PlayerMatchCardProps) {
  const { data: game } = useLcuApiWithCache(
    "/lol-match-history/v1/games/:gameId",
    {
      params: { gameId: `${gameId}` },
      hookOptions: {
        staleTime: -1,
      },
    }
  );

  const items = ([1, 2, 3, 4, 5, 6] as const).map(
    (i) => info.stats[`item${i}`]
  );
  const cherryAugment = ([1, 2, 3, 4, 5, 6] as const).map(
    (i) => info.stats[`playerAugment${i}`]
  );

  return (
    <div className="flex flex-row items-center justify-center p-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-row gap-2">
            <div className="relative">
              <ChampionIcon className="size-14" championId={info.championId} />
              <Badge className="absolute bottom-0 right-0 rounded-full size-5 font-mono tabular-nums">
                {info.stats.champLevel}
              </Badge>
            </div>
            {game?.gameMode === "CHERRY" ? (
              <div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-1">
                {cherryAugment.map((augmentId, index) => (
                  <CherryAugmentIcon key={index} cherryAugmentId={augmentId} />
                ))}
              </div>
            ) : (
              <div className="flex flex-row gap-1">
                <div className="flex flex-col">
                  <SpellIcon spellId={info.spell1Id} />
                  <SpellIcon spellId={info.spell2Id} />
                </div>
                <div className="flex flex-col">
                  <PerkIcon perkId={info.stats.perkPrimaryStyle} />
                  <PerkIcon perkId={info.stats.perkSubStyle} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          {items.map((itemId, index) => (
            <ItemIcon key={index} itemId={itemId} />
          ))}
        </div>
        <PlayerStates info={info} game={game} />
      </div>
      <div></div>
    </div>
  );
}

function PlayerStates({
  info,
  game,
}: {
  info: PlayerMatchCardProps["info"];
  game?: z.infer<typeof gameSchema>;
}) {
  const { t } = useI18n();

  const stats = useMemo(() => {
    if (!game) return;

    const isTop = (key: keyof PlayerMatchCardProps["info"]["stats"]) => {
      return !game.participants.some(
        (participant) => participant.stats[key] > info.stats[key]
      );
    };

    return {
      topKills: isTop("kills"),
      topDeaths: isTop("deaths"),
      topAssists: isTop("assists"),
      topDamage: isTop("totalDamageDealtToChampions"),
      topDefense: isTop("totalDamageTaken"),
      topHeal: isTop("totalHeal"),
      topGold: isTop("goldEarned"),
    };
  }, [game, info]);

  const WithTooltip = useCallback(
    ({
      children,
      tooltip,
    }: {
      children: React.ReactNode;
      tooltip: React.ReactNode;
    }) => {
      return (
        <Tooltip>
          <TooltipTrigger className="flex items-center justify-center size-5">
            {children}
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      );
    },
    []
  );

  if (!stats) return <Skeleton className="w-36 h-4" />;

  const {
    topKills,
    topDeaths,
    topAssists,
    topDamage,
    topDefense,
    topHeal,
    topGold,
  } = stats;

  const { largestMultiKill, tripleKills, quadraKills, pentaKills } = info.stats;

  return (
    <div className="flex flex-row gap-1 h-5">
      {tripleKills > 0 && (
        <WithTooltip tooltip={t["match.triple-kills"]()}>
          <MultiKillIcon count={3} size={5} />
        </WithTooltip>
      )}
      {quadraKills > 0 && (
        <WithTooltip tooltip={t["match.quadra-kills"]()}>
          <MultiKillIcon count={4} size={5} />
        </WithTooltip>
      )}
      {pentaKills > 0 && (
        <WithTooltip tooltip={t["match.penta-kills"]()}>
          <MultiKillIcon count={5} size={5} />
        </WithTooltip>
      )}
      {topKills && (
        <WithTooltip tooltip={t["match.top-kills"]()}>
          <Sword className="text-zinc-300" />
        </WithTooltip>
      )}
      {topDeaths && (
        <WithTooltip tooltip={t["match.top-deaths"]()}>
          <Skull />
        </WithTooltip>
      )}
      {topAssists && (
        <WithTooltip tooltip={t["match.top-assists"]()}>
          <Handshake className="text-yellow-500" />
        </WithTooltip>
      )}
      {topDamage && (
        <WithTooltip tooltip={t["match.top-damage"]()}>
          <Flame className="text-amber-500" />
        </WithTooltip>
      )}
      {topDefense && (
        <WithTooltip tooltip={t["match.top-defense"]()}>
          <ShieldX className="text-orange-400" />
        </WithTooltip>
      )}
      {topHeal && (
        <WithTooltip tooltip={t["match.top-heal"]()}>
          <HeartPlus className="text-green-400" />
        </WithTooltip>
      )}
      {topGold && (
        <WithTooltip tooltip={t["match.top-gold"]()}>
          <Coins className="text-yellow-400" />
        </WithTooltip>
      )}
      {largestMultiKill >= 8 && (
        <WithTooltip tooltip={t["match.legendary"]()}>
          <MultiKillIcon count="legendary" size={5} />
        </WithTooltip>
      )}
    </div>
  );
}
