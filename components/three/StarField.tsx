"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, type Points, type ShaderMaterial } from "three";
import type { SceneConfig } from "@/types/scene";

interface StarFieldProps {
  stars: SceneConfig["stars"];
  count: number;
  animate: boolean;
}

const vertexShader = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vTwinkle;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = max(-mv.z, 1.0);
    gl_PointSize = max(1.0, uSize * aScale * uPixelRatio * (1.0 + 6.0 / dist));
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.3 + aPhase);
  }`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vTwinkle * uOpacity);
  }`;

/** Deterministic pseudo-random numbers, so the sky is identical on every load and in tests. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Distant stars above the horizon plus a sparse layer of particles drifting
 * around the products (TRD §16). One draw call; twinkle runs in the shader.
 */
export function StarField({ stars, count, animate }: StarFieldProps) {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const random = seeded(42);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const nearShare = 0.3;
    for (let i = 0; i < count; i += 1) {
      const near = random() < nearShare;
      positions[i * 3] = (random() - 0.5) * (near ? 14 : stars.depth * 2.2);
      positions[i * 3 + 1] = near ? 0.25 + random() * 3.5 : 0.4 + Math.pow(random(), 0.7) * 16;
      positions[i * 3 + 2] = near ? -5 + random() * 7 : -8 - random() * stars.depth;
      scales[i] = near ? 0.9 + random() * 1.4 : 0.4 + random() * 1.1;
      phases[i] = random() * Math.PI * 2;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("aScale", new BufferAttribute(scales, 1));
    g.setAttribute("aPhase", new BufferAttribute(phases, 1));
    return g;
  }, [count, stars.depth]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: stars.size },
      uOpacity: { value: stars.opacity },
      uPixelRatio: { value: 1 },
      uColor: { value: new Color(stars.color) },
    }),
    [stars.size, stars.opacity, stars.color],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Uniforms are updated through the material ref, never by mutating memoized values.
  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uPixelRatio!.value = state.viewport.dpr;
    if (!animate) return;
    material.uniforms.uTime!.value += delta;
    if (pointsRef.current) pointsRef.current.rotation.y += delta * stars.speed * 0.1;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
