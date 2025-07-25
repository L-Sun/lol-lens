import { useEventListener } from "ahooks";
import { format, formatDistance } from "date-fns";
import * as dateFnsLocale from "date-fns/locale";
import {
  Coins,
  Flame,
  Handshake,
  HeartPlus,
  ShieldX,
  Skull,
  Sword,
} from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { z } from "zod";

import {
  ChampionIcon,
  CherryAugmentIcon,
  ItemIcon,
  MultiKillIcon,
  PerkStyleIcon,
  SpellIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n, useLcuApiWithCache } from "@/hooks";
import {
  gameSchema,
  participantIdentitySchema,
  participantSchema,
  SubteamPlacement,
} from "@/lcu/types";
import { cn } from "@/utils";

interface PlayerMatchCardProps {
  gameId: z.infer<typeof gameSchema>["gameId"];
  participant: z.infer<typeof participantSchema>;
}

export function PlayerMatchCard({ gameId, participant }: PlayerMatchCardProps) {
  const { data: game } = useLcuApiWithCache(
    "/lol-match-history/v1/games/:gameId",
    {
      params: { gameId: `${gameId}` },
      hookOptions: {
        staleTime: -1,
      },
    },
  );

  return (
    <Card
      className={cn(
        "flex flex-row items-stretch justify-between gap-0 rounded-[6px] border-l-6 p-4",
        participant.stats.win
          ? "border-l-[#5383e8] bg-[#ecf2ff] dark:border-l-[#5383e8] dark:bg-[#28344e]"
          : "border-l-[#e85353] bg-[#ffe3e3] dark:border-l-[#e84057] dark:bg-[#59343b]",
      )}
    >
      <GameInfo
        win={participant.stats.win}
        game={game}
        subteamPlacement={participant.stats.subteamPlacement}
      />
      <div className="flex flex-row gap-2">
        <div className="flex flex-col justify-center gap-2">
          <div className="flex flex-row items-center gap-2">
            <ChampionIconWithLevel
              championId={participant.championId}
              level={participant.stats.champLevel}
            />
            {game?.gameMode === "CHERRY" ? (
              <CherryAugments stats={participant.stats} />
            ) : (
              <PlayerSpellsAndPerks participant={participant} />
            )}
          </div>
          <PlayerItems stats={participant.stats} />
        </div>
        <Separator orientation="vertical" />
        <div className="flex flex-col items-center gap-2">
          <KDA stats={participant.stats} />
          <Separator />
          <PlayerStates participant={participant} game={game} />
        </div>
      </div>
      <Team game={game} />
    </Card>
  );
}

function GameInfo({
  game,
  win,
  subteamPlacement,
}: {
  game: z.infer<typeof gameSchema> | undefined;
  win: boolean;
  subteamPlacement: SubteamPlacement;
}) {
  const { t, language } = useI18n();

  const locale =
    dateFnsLocale[language.replace("-", "") as keyof typeof dateFnsLocale];

  return game ? (
    <div className="flex flex-col gap-2">
      <div>
        <div
          className={cn(
            "text-base font-bold",
            win ? "text-[#5383e8]" : "text-[#e85353]",
          )}
        >
          {t[`game-mode.${game.gameMode}`]()}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {game.gameCreationDate &&
            formatDistance(game.gameCreationDate, new Date(), {
              locale,
              addSuffix: true,
            })}
        </div>
      </div>
      <Separator />
      <div>
        <div className="flex items-center text-base font-bold">
          {win ? t["match.win"]() : t["match.lose"]()}
          {game.gameMode === "CHERRY" && (
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              （{t[`match.cherry-${subteamPlacement}`]()}）
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(game.gameDuration * 1000), "m'm' s's'")}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Separator />
      <div className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function ChampionIconWithLevel({
  championId,
  level,
}: {
  championId: z.infer<typeof participantSchema>["championId"];
  level: z.infer<typeof participantSchema>["stats"]["champLevel"];
}) {
  return (
    <div className="relative">
      <ChampionIcon className="size-16 rounded-full" championId={championId} />
      <Badge className="absolute right-0 bottom-0 size-5 rounded-full font-mono tabular-nums">
        {level}
      </Badge>
    </div>
  );
}

function CherryAugments({
  stats,
}: {
  stats: z.infer<typeof participantSchema>["stats"];
}) {
  const cherryAugment = ([1, 2, 3, 4, 5, 6] as const).map(
    (i) => stats[`playerAugment${i}`],
  );

  return (
    <div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-1">
      {cherryAugment.map((augmentId, index) => (
        <CherryAugmentIcon
          className="border-2"
          key={index}
          cherryAugmentId={augmentId}
        />
      ))}
    </div>
  );
}

function PlayerSpellsAndPerks({
  participant,
}: {
  participant: z.infer<typeof participantSchema>;
}) {
  return (
    <div className="grid grid-flow-col grid-cols-3 grid-rows-2 gap-1">
      <SpellIcon className="border-2" spellId={participant.spell1Id} />
      <SpellIcon className="border-2" spellId={participant.spell2Id} />
      <PerkStyleIcon
        className="rounded-full border-2 bg-black"
        perkStyleId={participant.stats.perkPrimaryStyle}
      />
      <PerkStyleIcon
        className="rounded-full border-2 bg-black"
        perkStyleId={participant.stats.perkSubStyle}
      />
    </div>
  );
}

function KDA({ stats }: { stats: z.infer<typeof participantSchema>["stats"] }) {
  const { kills, deaths, assists } = stats;
  const kda = (kills + assists) / (deaths || 1);

  return (
    <div className="flex w-24 flex-col items-center">
      <div className="text-base font-bold">
        <span>{kills}</span> / <span className="text-red-600">{deaths}</span> /{" "}
        <span>{assists}</span>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        KDA = {kda.toFixed(2)}
      </div>
    </div>
  );
}

function PlayerItems({
  stats,
}: {
  stats: z.infer<typeof participantSchema>["stats"];
}) {
  const items = ([0, 1, 2, 3, 4, 5, 6] as const).map((i) => stats[`item${i}`]);

  return (
    <div className="flex flex-row items-center gap-[2px]">
      {items.map((itemId, index) => (
        <ItemIcon key={index} itemId={itemId} className="rounded-sm border-2" />
      ))}
    </div>
  );
}

function PlayerStates({
  participant,
  game,
}: {
  participant: z.infer<typeof participantSchema>;
  game?: z.infer<typeof gameSchema>;
}) {
  const { t } = useI18n();

  const stats = useMemo(() => {
    if (!game) return;

    const isTop = (key: keyof PlayerMatchCardProps["participant"]["stats"]) => {
      return !game.participants.some(
        (other) => other.stats[key] > participant.stats[key],
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
  }, [game, participant]);

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
          <TooltipTrigger className="flex size-5 items-center justify-center">
            {children}
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={5}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      );
    },
    [],
  );

  if (!stats) return <Skeleton className="h-4 w-36" />;

  const {
    topKills,
    topDeaths,
    topAssists,
    topDamage,
    topDefense,
    topHeal,
    topGold,
  } = stats;

  const { largestMultiKill, tripleKills, quadraKills, pentaKills } =
    participant.stats;

  return (
    <div className="grid grid-cols-5 grid-rows-2 gap-1 py-1">
      {largestMultiKill >= 8 && (
        <WithTooltip tooltip={t["match.legendary"]()}>
          <MultiKillIcon count="legendary" size={5} />
        </WithTooltip>
      )}
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
      {topDamage && (
        <WithTooltip tooltip={t["match.top-damage"]()}>
          <Flame className="text-amber-500" />
        </WithTooltip>
      )}
      {topKills && (
        <WithTooltip tooltip={t["match.top-kills"]()}>
          <Sword className="text-zinc-300" />
        </WithTooltip>
      )}
      {topAssists && (
        <WithTooltip tooltip={t["match.top-assists"]()}>
          <Handshake className="text-yellow-500" />
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

      {topDeaths && (
        <WithTooltip tooltip={t["match.top-deaths"]()}>
          <Skull />
        </WithTooltip>
      )}
      <div className="size-5"></div>
    </div>
  );
}

function Team({ game }: { game: z.infer<typeof gameSchema> | undefined }) {
  const participants = game?.participants
    .slice()
    .sort((a, b) => a.teamId - b.teamId);

  return participants ? (
    <div
      className={cn(
        "grid grid-flow-col grid-cols-2 gap-1",
        game?.gameMode === "CHERRY" ? "grid-rows-8" : "grid-rows-5",
      )}
    >
      {participants.map((participant) => {
        const participantIdentity = game?.participantIdentities.find(
          (participantIdentity) =>
            participantIdentity.participantId === participant.participantId,
        );
        if (!participantIdentity) return null;

        return (
          <TeamMember
            key={participantIdentity.participantId}
            participantIdentity={participantIdentity}
            participant={participant}
          />
        );
      })}
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-20" />
      ))}
    </div>
  );
}

function TeamMember({
  participantIdentity,
  participant,
}: {
  participantIdentity: z.infer<typeof participantIdentitySchema>;
  participant: z.infer<typeof participantSchema>;
}) {
  const ref = useRef(null);
  const navigate = useNavigate();

  useEventListener(
    "click",
    () => {
      Promise.resolve(navigate(`/user/${puuid}`)).catch(console.error);
    },
    { target: ref },
  );

  const {
    participantId,
    player: { gameName, puuid },
  } = participantIdentity;
  const { championId } = participant;

  return (
    <div
      ref={ref}
      className="hover:bg-accent flex h-4 w-25 cursor-pointer flex-row items-center gap-1 rounded transition-colors"
      key={participantId}
    >
      <ChampionIcon className="size-4" championId={championId ?? 0} />
      <span className="truncate text-sm text-gray-500 dark:text-gray-400">
        {gameName}
      </span>
    </div>
  );
}
