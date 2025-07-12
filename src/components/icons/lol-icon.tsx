import { useRequest } from "ahooks";
import { useContext, useEffect, useState } from "react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { fetch } from "@/lcu/fetch";
import { LcuInfoContext } from "@/lcu/provider";
import { cn } from "@/utils/tailwind";

export interface LoLIconProps
  extends Omit<React.ComponentProps<typeof LoLIconImpl>, "children" | "blob"> {
  path: string;
}

export function LoLIcon({ path, ...props }: LoLIconProps) {
  const info = useContext(LcuInfoContext);
  const { data } = useRequest(
    async () => {
      if (!info.running) return;

      const response = await fetch(path, info);
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("image")) return;

      return await response.blob();
    },
    {
      ready: info.running,
      cacheKey: path,
      staleTime: -1,
    }
  );

  return <LoLIconImpl blob={data} {...props} />;
}

export interface LoLIconImplProps
  extends Omit<React.ComponentProps<typeof Avatar>, "children"> {
  imgClassName?: string;
  blob: Blob | undefined;
}

export function LoLIconImpl({
  className,
  imgClassName,
  blob,
  ...props
}: LoLIconImplProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  useEffect(() => {
    if (blob) {
      let url: string | undefined;
      try {
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (error) {
        console.error(error);
      }

      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [blob]);

  return (
    <Avatar className={cn(className)} {...props}>
      {imageUrl ? (
        <AvatarImage className={imgClassName} src={imageUrl} />
      ) : (
        <Skeleton className="size-full rounded-none" />
      )}
    </Avatar>
  );
}
