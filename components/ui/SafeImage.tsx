"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image that never shows a broken-image icon (TRD §52): if the file is
 * missing or fails to load, a neutral panel takes its place. The alt text is
 * kept on the placeholder so screen-reader users still get the description.
 */
export function SafeImage({ className, alt, ...props }: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  if (failedSrc === props.src) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={cn(props.fill ? "absolute inset-0 block bg-surface" : "inline-block bg-surface", className)}
        style={props.fill ? undefined : { width: Number(props.width) || undefined, height: Number(props.height) || undefined }}
        data-image-fallback=""
      />
    );
  }
  return <Image {...props} alt={alt} className={className} onError={() => setFailedSrc(props.src)} />;
}
