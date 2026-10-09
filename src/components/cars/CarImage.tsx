"use client";

import Image from "next/image";
import { CarFront } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CarImageProps = {
  /** Image source. Empty or missing values render the placeholder. */
  src?: string | null;
  alt: string;
  /** Fixed aspect ratio passed to the wrapper (`aspect-ratio` CSS value). */
  aspectRatio?: string;
  /** Tailwind classes for the wrapper. */
  className?: string;
  /** Tailwind classes for the `<img>` element. */
  imageClassName?: string;
  /** Responsive `sizes` hint for `next/image`. */
  sizes?: string;
  /** Load the image eagerly (above-the-fold heroes). */
  priority?: boolean;
};

function CarImage({
  src,
  alt,
  aspectRatio = "4 / 3",
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: CarImageProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      data-slot="car-image"
      className={cn(
        "relative w-full overflow-hidden bg-muted ring-1 ring-inset ring-foreground/5",
        className,
      )}
      style={{ aspectRatio }}
    >
      {showPlaceholder ? (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full items-center justify-center"
        >
          <CarFront
            aria-hidden="true"
            className="size-10 text-muted-foreground/50"
          />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={cn("object-cover", imageClassName)}
        />
      )}
    </div>
  );
}

export { CarImage };
export type { CarImageProps };
