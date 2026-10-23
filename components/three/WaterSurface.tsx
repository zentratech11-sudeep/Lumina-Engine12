"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Color, PlaneGeometry, RepeatWrapping, Vector3 } from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import type { Quality, SceneConfig } from "@/types/scene";

interface WaterSurfaceProps {
  water: SceneConfig["water"];
  fogEnabled: boolean;
  quality: Quality;
  animate: boolean;
}

/**
 * Dark reflective water (TRD §15): a plane with an animated normal map,
 * a planar reflection, and glints from a light source sitting on the horizon.
 * Low quality halves the reflection resolution.
 */
export function WaterSurface({ water, fogEnabled, quality, animate }: WaterSurfaceProps) {
  const normals = useTexture(water.normalMap, (texture) => {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  });

  const waterRef = useRef<Water>(null);

  const mesh = useMemo(() => {
    const resolution = quality === "high" ? 1024 : 512;
    const surface = new Water(new PlaneGeometry(320, 320), {
      textureWidth: resolution,
      textureHeight: resolution,
      waterNormals: normals,
      // A low light on the horizon: glints gather near the horizon, not at the viewer's feet.
      sunDirection: new Vector3(0, 0.05, -1).normalize(),
      sunColor: new Color(water.sheen),
      waterColor: new Color(water.color),
      distortionScale: water.distortion,
      fog: fogEnabled,
    });
    surface.rotation.x = -Math.PI / 2;
    surface.material.uniforms.size!.value = water.waveScale;
    return surface;
  }, [normals, quality, water.sheen, water.color, water.distortion, water.waveScale, fogEnabled]);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    },
    [mesh],
  );

  useFrame((_, delta) => {
    if (!animate || !waterRef.current) return;
    waterRef.current.material.uniforms.time!.value += delta * water.waveSpeed;
  });

  return <primitive ref={waterRef} object={mesh} />;
}
