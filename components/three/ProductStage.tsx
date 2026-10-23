"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import type { Group, Material } from "three";
import { collectionTimeline, duration, ease } from "@/config/motion";
import type { ResolvedCollection, ResolvedSlide, TransitionStyle } from "@/types/collection";
import type { SceneConfig } from "@/types/scene";
import { applyOpacity } from "./fade";
import { createProductMaterials, type ProductMaterials } from "./materials";
import { ProductModel } from "./ProductModel";

/** Products rest slightly below the waterline so they read as floating, not hovering. */
const WATERLINE = -0.03;

/** Where a product starts (entering) or ends (leaving), relative to its resting place. */
interface Pose {
  x: number;
  y: number;
  z: number;
  spin: number;
  fade: number;
}

const rest: Pose = { x: 0, y: 0, z: 0, spin: 0, fade: 1 };

/** The three movement styles a collection can choose (collection.transition). */
function offstagePose(style: TransitionStyle, direction: 1 | -1, entering: boolean): Pose {
  const side = entering ? direction : -direction;
  switch (style) {
    case "drift":
      return { x: side * 4.2, y: -1.5, z: -1.6, spin: side * 0.6, fade: 1 };
    case "fade":
      return { x: side * 0.4, y: 0, z: -1.2, spin: 0, fade: 0 };
    case "rise":
    default:
      return { x: side * 0.6, y: -1.7, z: 0, spin: side * 0.35, fade: 1 };
  }
}

interface StageEntry {
  key: number;
  collection: number;
  slide: number;
  leaving: boolean;
  direction: 1 | -1;
  animateIn: boolean;
}

interface StageState {
  collection: number;
  slide: number;
  nextKey: number;
  entries: StageEntry[];
}

/** Narrow screens bring the featured product to the centre and pull the others in (PRD §25). */
function useStageLayout() {
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const portrait = aspect < 0.9;
  return { portrait, spread: portrait ? 0.45 : aspect < 1.4 ? 0.8 : 1 };
}

interface SlideGroupProps {
  slide: ResolvedSlide;
  entry: StageEntry;
  style: TransitionStyle;
  materials: ProductMaterials;
  brandName: string;
  labelColor: string;
  fontFamily: string;
  reducedMotion: boolean;
  onExited: (key: number) => void;
}

function SlideGroup({ slide, entry, style, materials, brandName, labelColor, fontFamily, reducedMotion, onExited }: SlideGroupProps) {
  const travelRefs = useRef<Array<Group | null>>([]);
  const bobRefs = useRef<Array<Group | null>>([]);
  // One animated pose per staged product; read every frame, written by GSAP.
  const poses = useRef<Pose[]>(slide.stage.map(() => ({ ...rest })));
  const appliedFade = useRef<number[]>(slide.stage.map(() => -1));
  const clones = useRef<Material[]>([]);
  const phases = useMemo(() => slide.stage.map((_, i) => i * 1.7 + slide.id.length), [slide]);
  const { portrait, spread } = useStageLayout();

  useLayoutEffect(() => {
    const targets = poses.current;
    if (!entry.animateIn || reducedMotion) {
      targets.forEach((pose) => Object.assign(pose, rest));
      return;
    }
    targets.forEach((pose, i) => {
      Object.assign(pose, offstagePose(style, entry.direction, true));
      gsap.to(pose, {
        ...rest,
        duration: duration.cinematic,
        delay: collectionTimeline.productEnter + i * 0.12,
        ease: ease.out,
      });
    });
    return () => {
      gsap.killTweensOf(targets);
    };
  }, [entry.animateIn, entry.direction, reducedMotion, style]);

  useEffect(() => {
    if (!entry.leaving) return;
    const targets = poses.current;
    if (reducedMotion) {
      onExited(entry.key);
      return;
    }
    gsap.killTweensOf(targets);
    const timeline = gsap.timeline({ onComplete: () => onExited(entry.key) });
    targets.forEach((pose, i) => {
      timeline.to(
        pose,
        { ...offstagePose(style, entry.direction, false), duration: duration.slow, ease: ease.in },
        collectionTimeline.productExit + i * 0.06,
      );
    });
    return () => {
      timeline.kill();
    };
  }, [entry.leaving, entry.direction, entry.key, reducedMotion, onExited, style]);

  useEffect(() => {
    const owned = clones.current;
    return () => owned.forEach((material) => material.dispose());
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    slide.stage.forEach((staged, i) => {
      const pose = poses.current[i];
      const travel = travelRefs.current[i];
      if (!pose || !travel) return;
      travel.position.set(pose.x, pose.y, pose.z);
      travel.rotation.y = pose.spin;
      const opacity = staged.opacity * pose.fade;
      if (Math.abs(opacity - (appliedFade.current[i] ?? -1)) > 0.004) {
        applyOpacity(travel, opacity, clones.current);
        appliedFade.current[i] = opacity;
      }
      const bob = bobRefs.current[i];
      if (!bob || reducedMotion) return;
      const phase = phases[i] ?? 0;
      bob.position.y = Math.sin(t * 0.8 + phase) * 0.025;
      bob.rotation.z = Math.sin(t * 0.55 + phase) * 0.012;
      bob.rotation.x = Math.cos(t * 0.5 + phase) * 0.01;
    });
  });

  return (
    <group>
      {slide.stage.map((staged, i) => {
        const isFeatured = staged.productId === slide.featured.id;
        const [x, y, z] = staged.position;
        const px = portrait && isFeatured ? 0 : x * spread;
        const pz = portrait && !isFeatured ? z - 1.5 : z;
        return (
          <group key={`${staged.productId}-${i}`} position={[px, y + WATERLINE, pz]} rotation={staged.rotation} scale={staged.scale}>
            <group ref={(g) => void (travelRefs.current[i] = g)}>
              <group ref={(g) => void (bobRefs.current[i] = g)}>
                <ProductModel
                  product={staged.product}
                  brandName={brandName}
                  labelColor={labelColor}
                  fontFamily={fontFamily}
                  materials={materials}
                />
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}

interface StageProps {
  collections: ResolvedCollection[];
  collection: number;
  slide: number;
  direction: 1 | -1;
  scene: SceneConfig;
  brandName: string;
  fontFamily: string;
  reducedMotion: boolean;
}

/**
 * Keeps the outgoing slide mounted until its exit animation finishes,
 * while the incoming slide animates in on the TRD §20 timeline.
 * Only the slides on stage are mounted, so their models load on demand (TRD §43).
 */
export function ProductStage({ collections, collection, slide, direction, scene, brandName, fontFamily, reducedMotion }: StageProps) {
  const [stage, setStage] = useState<StageState>(() => ({
    collection,
    slide,
    nextKey: 1,
    entries: [{ key: 0, collection, slide, leaving: false, direction, animateIn: false }],
  }));

  // React-recommended pattern for deriving state from changed props during render.
  if (stage.collection !== collection || stage.slide !== slide) {
    setStage((current) => ({
      collection,
      slide,
      nextKey: current.nextKey + 1,
      entries: [
        ...current.entries.map((e) => ({ ...e, leaving: true, direction })),
        { key: current.nextKey, collection, slide, leaving: false, direction, animateIn: true },
      ],
    }));
  }

  const onExited = useMemo(
    () => (key: number) => setStage((current) => ({ ...current, entries: current.entries.filter((e) => e.key !== key) })),
    [],
  );

  const materials = useMemo(() => createProductMaterials(scene.products), [scene.products]);
  useEffect(() => () => materials.dispose(), [materials]);

  return (
    <group>
      {stage.entries.map((entry) => {
        const owner = collections[entry.collection];
        const resolved = owner?.slides[entry.slide];
        if (!owner || !resolved) return null;
        return (
          <SlideGroup
            key={entry.key}
            slide={resolved}
            entry={entry}
            style={owner.transition}
            materials={materials}
            brandName={brandName}
            labelColor={scene.products.labelColor}
            fontFamily={fontFamily}
            reducedMotion={reducedMotion}
            onExited={onExited}
          />
        );
      })}
    </group>
  );
}
