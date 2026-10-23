"use client";

import { useEffect, useMemo } from "react";
import { CylinderGeometry, LatheGeometry, Vector2 } from "three";
import { RoundedBox } from "@react-three/drei";
import type { PlaceholderShape } from "@/types/product";
import { createLabelMaterial, createLabelTexture, type ProductMaterials } from "./materials";

interface PlaceholderProductProps {
  shape: PlaceholderShape;
  brandName: string;
  productName: string;
  labelColor: string;
  fontFamily: string;
  materials: ProductMaterials;
}

/** Revolves a 2D profile [radius, height][] into a smooth bottle body. */
function lathe(points: Array<[number, number]>): LatheGeometry {
  return new LatheGeometry(
    points.map(([x, y]) => new Vector2(x, y)),
    64,
  );
}

/** A label wrapped around part of a cylinder, centred on the side facing the camera. */
function wrapLabel(radiusTop: number, radiusBottom: number, height: number, arc: number): CylinderGeometry {
  return new CylinderGeometry(radiusTop, radiusBottom, height, 48, 1, true, -arc / 2, arc);
}

type BuiltGeometry = { body?: LatheGeometry; label?: CylinderGeometry };

function buildGeometry(shape: PlaceholderShape): BuiltGeometry {
  switch (shape) {
    case "jar":
      return {
        body: lathe([[0, 0], [0.5, 0], [0.535, 0.012], [0.55, 0.045], [0.55, 0.39], [0.54, 0.415], [0.5, 0.425], [0, 0.425]]),
        label: wrapLabel(0.553, 0.553, 0.3, 1.9),
      };
    case "tube":
      return { label: wrapLabel(0.298, 0.237, 0.6, 1.5) };
    case "pump":
      return {
        body: lathe([[0, 0], [0.3, 0], [0.32, 0.02], [0.32, 0.82], [0.3, 0.9], [0.22, 0.96], [0.12, 0.99], [0, 0.99]]),
        label: wrapLabel(0.322, 0.322, 0.46, 1.7),
      };
    case "bottle":
      return {
        body: lathe([[0, 0], [0.26, 0], [0.28, 0.02], [0.28, 1.0], [0.24, 1.06], [0.14, 1.1], [0, 1.1]]),
        label: wrapLabel(0.282, 0.282, 0.56, 1.7),
      };
    default:
      return {};
  }
}

/**
 * Stand-in packaging built from primitives. It exists so a brand can be
 * previewed before photography or 3D models arrive; add `model3D` or
 * `sceneImage` to a product and this is no longer used.
 */
export function PlaceholderProduct({ shape, brandName, productName, labelColor, fontFamily, materials }: PlaceholderProductProps) {
  const layout = shape === "slim" ? "tall" : shape === "flacon" ? "badge" : "wide";
  const label = useMemo(() => {
    const size = { wide: [1024, 384], tall: [384, 1024], badge: [512, 512] }[layout] as [number, number];
    const texture = createLabelTexture({
      brand: brandName,
      product: productName,
      color: labelColor,
      fontFamily,
      width: size[0],
      height: size[1],
      layout,
    });
    return { texture, material: createLabelMaterial(texture) };
  }, [brandName, productName, labelColor, fontFamily, layout]);

  const geometry = useMemo(() => buildGeometry(shape), [shape]);

  useEffect(
    () => () => {
      label.texture.dispose();
      label.material.dispose();
    },
    [label],
  );

  useEffect(
    () => () => {
      geometry.body?.dispose();
      geometry.label?.dispose();
    },
    [geometry],
  );

  const { body, knurled, metal, satin } = materials;

  switch (shape) {
    case "jar":
      return (
        <group>
          <mesh material={body}>
            <primitive object={geometry.body!} attach="geometry" />
          </mesh>
          <mesh material={metal} position-y={0.437}>
            <cylinderGeometry args={[0.556, 0.556, 0.026, 64]} />
          </mesh>
          <mesh position-y={0.55} material={[knurled, satin, body]}>
            <cylinderGeometry args={[0.566, 0.566, 0.2, 64]} />
          </mesh>
          <mesh position-y={0.215} material={label.material}>
            <primitive object={geometry.label!} attach="geometry" />
          </mesh>
        </group>
      );

    case "flacon":
      return (
        <group>
          <RoundedBox args={[0.92, 0.9, 0.46]} radius={0.06} smoothness={4} position-y={0.45} material={body} />
          <RoundedBox args={[0.76, 0.74, 0.02]} radius={0.01} smoothness={2} position={[0, 0.45, 0.226]} material={knurled} />
          <mesh position={[0, 0.45, 0.24]} material={metal}>
            <torusGeometry args={[0.165, 0.022, 16, 64]} />
          </mesh>
          <mesh position={[0, 0.45, 0.238]} rotation-x={Math.PI / 2} material={[body, label.material, body]}>
            <cylinderGeometry args={[0.15, 0.15, 0.012, 48]} />
          </mesh>
          <mesh position-y={0.94} material={metal}>
            <cylinderGeometry args={[0.09, 0.1, 0.08, 32]} />
          </mesh>
          <RoundedBox args={[0.34, 0.3, 0.34]} radius={0.03} smoothness={3} position-y={1.13} material={knurled} />
        </group>
      );

    case "slim":
      return (
        <group>
          <RoundedBox args={[0.36, 0.92, 0.24]} radius={0.03} smoothness={3} position-y={0.46} material={body} />
          <mesh position-y={0.935} material={metal}>
            <boxGeometry args={[0.352, 0.03, 0.232]} />
          </mesh>
          <RoundedBox args={[0.36, 0.36, 0.24]} radius={0.03} smoothness={3} position-y={1.13} material={knurled} />
          <mesh position={[0, 0.5, 0.1215]} material={label.material}>
            <planeGeometry args={[0.3, 0.8]} />
          </mesh>
        </group>
      );

    case "tube":
      return (
        <group>
          <mesh position-y={0.08} material={[knurled, satin, satin]}>
            <cylinderGeometry args={[0.2, 0.2, 0.16, 48]} />
          </mesh>
          <mesh position-y={0.17} material={metal}>
            <cylinderGeometry args={[0.205, 0.205, 0.02, 48]} />
          </mesh>
          <group scale-z={0.45}>
            <mesh position-y={0.67} material={body}>
              <cylinderGeometry args={[0.31, 0.21, 0.98, 48]} />
            </mesh>
            <mesh position-y={0.72} material={label.material}>
              <primitive object={geometry.label!} attach="geometry" />
            </mesh>
          </group>
          <RoundedBox args={[0.63, 0.07, 0.07]} radius={0.02} smoothness={2} position-y={1.17} material={body} />
        </group>
      );

    case "pump":
      return (
        <group>
          <mesh material={body}>
            <primitive object={geometry.body!} attach="geometry" />
          </mesh>
          <mesh position-y={1.02} material={metal}>
            <cylinderGeometry args={[0.12, 0.12, 0.07, 32]} />
          </mesh>
          <mesh position-y={1.09} material={metal}>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
          </mesh>
          <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.025} smoothness={2} position-y={1.17} material={knurled} />
          <mesh position={[0.17, 1.18, 0]} rotation-z={Math.PI / 2} material={body}>
            <cylinderGeometry args={[0.025, 0.025, 0.2, 16]} />
          </mesh>
          <mesh position-y={0.44} material={label.material}>
            <primitive object={geometry.label!} attach="geometry" />
          </mesh>
        </group>
      );

    case "bottle":
    default:
      return (
        <group>
          <mesh material={body}>
            <primitive object={geometry.body!} attach="geometry" />
          </mesh>
          <mesh position-y={1.115} material={metal}>
            <cylinderGeometry args={[0.152, 0.152, 0.03, 32]} />
          </mesh>
          <mesh position-y={1.24} material={[knurled, metal, body]}>
            <cylinderGeometry args={[0.15, 0.15, 0.22, 48]} />
          </mesh>
          <mesh position-y={0.52} material={label.material}>
            <primitive object={geometry.label!} attach="geometry" />
          </mesh>
        </group>
      );
  }
}
