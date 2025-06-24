import { useEffect, useState } from "react";

import { useLcuResource } from "@/hooks";
import { cn } from "@/utils/tailwind";

interface ProfileIconProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  profileIconId: number;
}

export function ProfileIcon({
  profileIconId,
  className,
  ...props
}: ProfileIconProps) {
  const { data, error, loading } = useLcuResource(
    `/lol-game-data/assets/v1/profile-icons/${profileIconId}.jpg`
  );

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      const url = URL.createObjectURL(data);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [data]);

  if (error) {
    return (
      <div
        className={cn("rounded-full bg-destructive/50", className)}
        {...props}
      />
    );
  }

  if (loading || !imageUrl) {
    return (
      <div
        className={cn("animate-pulse rounded-full bg-muted", className)}
        {...props}
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Profile Icon ${profileIconId}`}
      className={cn("rounded-full", className)}
      {...props}
    />
  );
}
