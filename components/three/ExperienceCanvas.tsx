"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import gsap from "gsap";
import { ACESFilmicToneMapping } from "three";
import { collectionTimeline, duration } from "@/config/motion";
import type { Environment, ResolvedCollection } from "@/types/collection";
import type { Quality, SceneConfig } from "@/types/scene";
import { CameraRig } from "./CameraRig";
import { Effects } from "./Effects";
import { HorizonGlow } from "./HorizonGlow";
import { ProductStage } from "./ProductStage";
import { SceneLights } from "./SceneLights";
import { SkyBackdrop } from "./SkyBackdrop";
import { StarField } from "./StarField";
import { WaterSurface } from "./WaterSurface";

export interface ExperienceCanvasProps {
  scene: SceneConfig;
  collections: ResolvedCollection[];
  collection: number;
  slide: number;
  direction: 1 | -1;
  environment: Environment;
  brandName: string;
  displayFont: string;
  quality: Quality;
  reducedMotion: boolean;
  /** False when the section is offscreen; rendering stops entirely. */
  active: boolean;
  pointer: RefObject<{ x: number; y: number }>;
  onReady?: () => void;
}

/** Labels are painted with the brand font, so wait for it before building them. */
function useFontReady(family: string): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && setReady(true);
    Promise.all([document.fonts.load(`500 64px "${family}"`), document.fonts.load(`400 64px "${family}"`)])
      .then(done)
      .catch(done);
    const timeout = window.setTimeout(done, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [family]);
  return ready;
}

/**
 * The glow dims while products change and swells back as the new ones settle
 * (TRD §20: environment transition at 400 ms).
 */
function useTransitionPulse(key: string, instant: boolean) {
  const pulse = useRef({ value: 1 });
  const first = useRef(true);
  useEffect(() => {
    if (first.current || instant) {
      first.current = false;
      return;
    }
    const target = pulse.current;
    const timeline = gsap
      .timeline()
      .to(target, { value: 0.55, duration: duration.normal, ease: "sine.inOut" }, 0)
      .to(target, { value: 1, duration: duration.cinematic, ease: "sine.out" }, collectionTimeline.environment);
    return () => {
      timeline.kill();
      target.value = 1;
    };
  }, [key, instant]);
  return pulse;
}

/**
 * The cinematic scene (TRD §12):
 * Canvas → Camera → Lights → Environment → StarField → WaterSurface (with reflection) → Products → Effects.
 * Everything visual comes from `scene` (the brand's scene.json) plus the active slide's environment.
 */
export default function ExperienceCanvas({
  scene,
  collections,
  collection,
  slide,
  direction,
  environment,
  brandName,
  displayFont,
  quality,
  reducedMotion,
  active,
  pointer,
  onReady,
}: ExperienceCanvasProps) {
  const fontReady = useFontReady(displayFont);
  const animate = !reducedMotion;
  const starCount = quality === "high" ? scene.stars.count : scene.stars.mobileCount;
  const pulse = useTransitionPulse(`${collection}:${slide}`, reducedMotion);
  // Drops resolution and post-processing if the device can't hold a steady frame rate (TRD §15, §27).
  const [degraded, setDegraded] = useState(false);
  const full = quality === "high" && !degraded;

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={full ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: quality === "high", powerPreference: "high-performance", toneMapping: ACESFilmicToneMapping }}
      camera={{ position: scene.camera.position, fov: scene.camera.fov, near: 0.1, far: 160 }}
      onCreated={({ camera }) => {
        camera.lookAt(...scene.camera.target);
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor flipflops={2} onDecline={() => setDegraded(true)} onFallback={() => setDegraded(true)} />
      <color attach="background" args={[scene.sky.top]} />
      <fog attach="fog" args={[environment.horizonColor, scene.fog.near, scene.fog.far]} />
      <CameraRig camera={scene.camera} pointer={pointer} parallax={animate && quality === "high"} />
      <SkyBackdrop top={scene.sky.top} horizon={environment.horizonColor} instant={reducedMotion} />
      <HorizonGlow glow={scene.glow} color={environment.glowColor} intensity={environment.glowIntensity} pulse={pulse} instant={reducedMotion} />
      <StarField stars={scene.stars} count={starCount} animate={animate} />
      <SceneLights lighting={scene.lighting} glowColor={scene.glow.color} />
      <Suspense fallback={null}>
        <WaterSurface water={scene.water} fogEnabled quality={quality} animate={animate} />
      </Suspense>
      {fontReady && (
        <ProductStage
          collections={collections}
          collection={collection}
          slide={slide}
          direction={direction}
          scene={scene}
          brandName={brandName}
          fontFamily={displayFont}
          reducedMotion={reducedMotion}
        />
      )}
      {full && <Effects effects={scene.effects} />}
    </Canvas>
  );
}
