"use client";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { SceneConfig } from "@/types/scene";

/**
 * Soft bloom on the water glints and the horizon, plus a gentle vignette.
 * Mounted only on high-quality devices (TRD §27).
 */
export function Effects({ effects }: { effects: SceneConfig["effects"] }) {
  if (effects.bloom <= 0 && effects.vignette <= 0) return null;
  return (
    <EffectComposer multisampling={0}>
      {effects.bloom > 0 ? (
        <Bloom mipmapBlur intensity={effects.bloom} luminanceThreshold={effects.bloomThreshold} luminanceSmoothing={0.2} />
      ) : (
        <></>
      )}
      {effects.vignette > 0 ? <Vignette offset={0.3} darkness={effects.vignette} /> : <></>}
    </EffectComposer>
  );
}
