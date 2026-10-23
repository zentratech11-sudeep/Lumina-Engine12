"use client";

import { Suspense, useMemo } from "react";
import { Billboard, useGLTF, useTexture } from "@react-three/drei";
import { DoubleSide, SRGBColorSpace } from "three";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import type { Product } from "@/types/product";
import type { ProductMaterials } from "./materials";
import { PlaceholderProduct } from "./PlaceholderProduct";

/** Draco decoder files are self-hosted in /public/draco so no third-party CDN is contacted. */
const DRACO_PATH = "/draco/";

/** Height in scene units that cut-out images are scaled to. */
const IMAGE_HEIGHT = 1.25;

interface ProductModelProps {
  product: Product;
  brandName: string;
  labelColor: string;
  fontFamily: string;
  materials: ProductMaterials;
}

function GltfProduct({ src, scale }: { src: string; scale: number }) {
  const { scene } = useGLTF(src, DRACO_PATH);
  const model = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={model} scale={scale} />;
}

function ImageProduct({ src }: { src: string }) {
  const texture = useTexture(src, (loaded) => {
    loaded.colorSpace = SRGBColorSpace;
  });
  const image = texture.image as { width: number; height: number } | undefined;
  const aspect = image ? image.width / image.height : 0.6;
  return (
    <Billboard lockX lockZ position-y={IMAGE_HEIGHT / 2}>
      <mesh>
        <planeGeometry args={[IMAGE_HEIGHT * aspect, IMAGE_HEIGHT]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.02} roughness={0.6} side={DoubleSide} />
      </mesh>
    </Billboard>
  );
}

/**
 * Renders a product in the 3D scene, trying in order:
 * 1. `model3D` (GLB/GLTF), 2. `sceneImage` (transparent cut-out), 3. a code-built placeholder.
 * Each step falls back to the next if its file is missing or fails to load,
 * so a broken asset never takes the scene down (TRD §29, §52).
 */
export function ProductModel({ product, brandName, labelColor, fontFamily, materials }: ProductModelProps) {
  const placeholder = (
    <PlaceholderProduct
      shape={product.placeholderShape}
      brandName={brandName}
      productName={product.name}
      labelColor={labelColor}
      fontFamily={fontFamily}
      materials={materials}
    />
  );

  const image = product.sceneImage ? (
    <ErrorBoundary fallback={placeholder} label={`scene image for ${product.id}`}>
      <Suspense fallback={null}>
        <ImageProduct src={product.sceneImage} />
      </Suspense>
    </ErrorBoundary>
  ) : (
    placeholder
  );

  if (!product.model3D) return image;

  return (
    <ErrorBoundary fallback={image} label={`3D model for ${product.id}`}>
      <Suspense fallback={null}>
        <GltfProduct src={product.model3D} scale={product.modelScale} />
      </Suspense>
    </ErrorBoundary>
  );
}
