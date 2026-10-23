"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import type { ResolvedSlide } from "@/types/collection";

/**
 * Image version of the stage (TRD §29): when WebGL is unavailable or the 3D
 * scene fails, the featured product's cut-out or catalog image stands in,
 * and navigation, title and counter keep working.
 */
export function StaticStage({ slide }: { slide: ResolvedSlide }) {
  const product = slide.featured;
  const src = product.sceneImage ?? product.image;
  if (!src) return null;
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-[22svh]" data-testid="static-stage">
      <div key={slide.id} className="static-stage-item relative aspect-[4/5] h-[min(52svh,560px)]">
        <SafeImage
          src={src}
          alt={product.imageAlt ?? product.name}
          fill
          sizes="(min-width: 1024px) 40vw, 80vw"
          className={product.sceneImage ? "object-contain" : "object-cover [mask-image:radial-gradient(ellipse_at_center,#000_55%,transparent_75%)]"}
        />
      </div>
    </div>
  );
}
