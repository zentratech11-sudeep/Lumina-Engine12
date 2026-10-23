"use client";

import { useMemo, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import type { SceneConfig } from "@/types/scene";

interface CameraRigProps {
  camera: SceneConfig["camera"];
  /** Pointer position in -1..1, written by the section's pointer handler. */
  pointer: RefObject<{ x: number; y: number }>;
  parallax: boolean;
}

/**
 * Holds the configured camera framing and adds a slight drift toward the
 * pointer on desktop. Pulls back on portrait screens so the centred product fits.
 */
export function CameraRig({ camera: config, pointer, parallax }: CameraRigProps) {
  const target = useMemo(() => new Vector3(...config.target), [config.target]);
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height));
  const distanceScale = aspect < 0.9 ? 1.25 : aspect < 1.4 ? 1.1 : 1;

  useFrame(({ camera }, delta) => {
    const [bx, by, bz] = config.position;
    const px = parallax ? pointer.current.x : 0;
    const py = parallax ? pointer.current.y : 0;
    const damping = 1 - Math.exp(-delta * 2.2);
    camera.position.x = MathUtils.lerp(camera.position.x, bx + px * 0.35, damping);
    camera.position.y = MathUtils.lerp(camera.position.y, by + py * 0.12, damping);
    camera.position.z = MathUtils.lerp(camera.position.z, bz * distanceScale, damping);
    camera.lookAt(target);
  });

  return null;
}
