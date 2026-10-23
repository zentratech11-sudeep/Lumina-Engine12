"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, Color, type Fog, type ShaderMaterial } from "three";

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    float t = pow(1.0 - h, 6.0);
    // Sub-pixel noise breaks up banding in the dark gradient.
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    gl_FragColor = vec4(mix(uTop, uHorizon, t) + n / 255.0, 1.0);
    #include <colorspace_fragment>
  }`;

interface SkyBackdropProps {
  top: string;
  /** Target horizon color. The fog follows it so the water fades into the same haze. */
  horizon: string;
  instant: boolean;
}

/** Gradient dome, dark overhead and lifting toward the horizon. */
export function SkyBackdrop({ top, horizon, instant }: SkyBackdropProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const target = useRef(new Color(horizon));
  const [uniforms] = useState(() => ({ uTop: { value: new Color(top) }, uHorizon: { value: new Color(horizon) } }));

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const blend = instant ? 1 : 1 - Math.exp(-delta / 0.14);
    target.current.set(horizon);
    (material.uniforms.uHorizon!.value as Color).lerp(target.current, blend);
    (state.scene.fog as Fog | null)?.color.lerp(target.current, blend);
  });

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[80, 32, 16]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
