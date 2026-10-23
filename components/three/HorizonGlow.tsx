"use client";

import { useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, type ShaderMaterial } from "three";
import type { SceneConfig } from "@/types/scene";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float a = pow(clamp(1.0 - length(p), 0.0, 1.0), 2.2) * uIntensity;
    gl_FragColor = vec4(uColor * a, a);
    #include <colorspace_fragment>
  }`;

interface HorizonGlowProps {
  glow: SceneConfig["glow"];
  /** Target color/intensity; changes blend in over ~400 ms (TRD §20 environment transition). */
  color: string;
  intensity: number;
  /** Multiplier animated during slide changes (1 = steady). */
  pulse?: RefObject<{ value: number }>;
  instant: boolean;
}

/** Soft elliptical light sitting on the horizon behind the products. */
export function HorizonGlow({ glow, color, intensity, pulse, instant }: HorizonGlowProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const target = useRef(new Color(color));
  const [uniforms] = useState(() => ({ uColor: { value: new Color(color) }, uIntensity: { value: intensity } }));

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const blend = instant ? 1 : 1 - Math.exp(-delta / 0.14);
    target.current.set(color);
    (material.uniforms.uColor!.value as Color).lerp(target.current, blend);
    const current = material.uniforms.uIntensity!.value as number;
    const goal = intensity * (pulse?.current.value ?? 1);
    material.uniforms.uIntensity!.value = current + (goal - current) * Math.max(blend, 0.25);
  });

  return (
    <mesh position={[0, 0.2, -22]} renderOrder={0}>
      <planeGeometry args={[glow.width, glow.height]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
