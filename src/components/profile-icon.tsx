import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLcuApi } from "@/hooks";
import { cn } from "@/utils/tailwind";

interface ProfileIconProps
  extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  profileIconId: number;
}

export function ProfileIcon({
  profileIconId,
  className,
  ...props
}: ProfileIconProps) {
  const { data, error, loading } = useLcuApi(
    "/lol-game-data/assets/v1/profile-icons/:id.jpg",
    { params: { id: profileIconId.toString() } }
  );

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      const url = URL.createObjectURL(data);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [data]);

  return (
    <Avatar className={cn(className)} {...props}>
      {!error && !loading && imageUrl && (
        <AvatarImage src={imageUrl} alt={`Profile Icon ${profileIconId}`} />
      )}
      <AvatarFallback className="bg-destructive/50">
        {error ? "!" : "..."}
      </AvatarFallback>
    </Avatar>
  );
}
