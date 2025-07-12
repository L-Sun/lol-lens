import { CSSProperties } from "react";

import { cn } from "@/utils";

interface MultiKillIconProps {
  size: number;
  count: 3 | 4 | 5 | "legendary";
}

export function MultiKillIcon({ count, size = 4 }: MultiKillIconProps) {
  const styles: CSSProperties = {
    fontSize: `calc(var(--spacing) * ${size})`,
    lineHeight: `calc(var(--spacing) * ${size})`,
  };

  return (
    <div
      className={cn(
        "text-center font-bold tabular-nums",
        count === "legendary" && "text-red-500",
        count === 5 && "text-red-500",
        count === 4 && "text-red-400",
        count === 3 && "text-red-300"
      )}
      style={styles}
    >
      {count === "legendary" ? "神" : count}
    </div>
  );
}
