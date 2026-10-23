"use client";

import { Environment, Lightformer } from "@react-three/drei";
import type { SceneConfig } from "@/types/scene";

/**
 * All scene lighting in one place (TRD §14). The environment is built from
 * light panels rather than an HDR file, so nothing is downloaded and the
 * glossy packaging picks up long, soft highlights.
 */
export function SceneLights({ lighting, glowColor }: { lighting: SceneConfig["lighting"]; glowColor: string }) {
  return (
    <>
      <ambientLight intensity={lighting.ambient} />
      <directionalLight color={lighting.key.color} intensity={lighting.key.intensity} position={lighting.key.position} />
      <pointLight color={lighting.rim.color} intensity={lighting.rim.intensity} position={lighting.rim.position} distance={20} decay={1.2} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[-4, 3, 5]} rotation-y={Math.PI / 5} scale={[2.5, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color={glowColor} position={[5, 2, 2]} rotation-y={-Math.PI / 3} scale={[1.2, 5, 1]} />
        <Lightformer form="rect" intensity={1.6} color={glowColor} position={[0, 0.4, -10]} scale={[20, 1.6, 1]} />
        <Lightformer form="circle" intensity={0.25} color="#ffffff" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={4} />
      </Environment>
    </>
  );
}
