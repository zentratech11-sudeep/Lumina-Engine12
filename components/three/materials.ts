import {
  CanvasTexture,
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";
import type { SceneConfig } from "@/types/scene";

export interface ProductMaterials {
  /** Glossy black glass / lacquer for bodies. */
  body: MeshPhysicalMaterial;
  /** Ridged caps. Ridges come from a bump map, not geometry, to keep polygon counts low. */
  knurled: MeshPhysicalMaterial;
  /** Polished trim rings, collars and medallions. */
  metal: MeshStandardMaterial;
  /** Smooth satin finish for flat cap tops. */
  satin: MeshStandardMaterial;
  dispose: () => void;
}

function createRidgeTexture(): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 4;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 64, 0);
    for (let i = 0; i <= 8; i += 1) {
      gradient.addColorStop(i / 8, i % 2 === 0 ? "#000" : "#fff");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 4);
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(14, 1);
  return texture;
}

export function createProductMaterials(colors: SceneConfig["products"]): ProductMaterials {
  const ridges = createRidgeTexture();
  const body = new MeshPhysicalMaterial({
    color: new Color(colors.bodyColor),
    roughness: 0.16,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.5,
  });
  const knurled = new MeshPhysicalMaterial({
    color: new Color(colors.bodyColor).offsetHSL(0, 0, 0.02),
    roughness: 0.42,
    metalness: 0.55,
    bumpMap: ridges,
    bumpScale: 3,
    envMapIntensity: 1.2,
  });
  const satin = new MeshStandardMaterial({
    color: new Color(colors.bodyColor).offsetHSL(0, 0, 0.03),
    metalness: 0.7,
    roughness: 0.38,
    envMapIntensity: 0.9,
  });
  const metal = new MeshStandardMaterial({
    color: new Color(colors.metalColor),
    metalness: 1,
    roughness: 0.24,
    envMapIntensity: 1.8,
  });
  return {
    body,
    knurled,
    metal,
    satin,
    dispose: () => {
      ridges.dispose();
      body.dispose();
      knurled.dispose();
      metal.dispose();
      satin.dispose();
    },
  };
}

interface LabelOptions {
  brand: string;
  product: string;
  color: string;
  fontFamily: string;
  /** Canvas size in px. Match the aspect of the surface the label wraps. */
  width: number;
  height: number;
  layout: "wide" | "tall" | "badge";
}

/**
 * Draws the printed label (brand wordmark + product name) to a canvas.
 * Uses the brand's display font, so labels change with the brand config.
 */
export function createLabelTexture({ brand, product, color, fontFamily, width, height, layout }: LabelOptions): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const family = `"${fontFamily}", Georgia, serif`;

    const fit = (text: string, weight: number, maxSize: number, maxWidth: number, spacing: number) => {
      let size = maxSize;
      do {
        ctx.font = `${weight} ${size}px ${family}`;
        ctx.letterSpacing = `${size * spacing}px`;
        size -= 2;
      } while (ctx.measureText(text).width > maxWidth && size > 8);
    };

    if (layout === "badge") {
      fit(brand.toUpperCase(), 500, height * 0.32, width * 0.78, 0.08);
      ctx.fillText(brand.toUpperCase(), width / 2, height / 2);
    } else if (layout === "tall") {
      fit(brand.toUpperCase(), 500, height * 0.09, width * 0.86, 0.14);
      ctx.fillText(brand.toUpperCase(), width / 2, height * 0.3);
      ctx.globalAlpha = 0.75;
      fit(product.toUpperCase(), 400, height * 0.035, width * 0.86, 0.12);
      ctx.fillText(product.toUpperCase(), width / 2, height * 0.42);
    } else {
      fit(brand.toUpperCase(), 500, height * 0.36, width * 0.7, 0.06);
      ctx.fillText(brand.toUpperCase(), width / 2, height * 0.42);
      ctx.globalAlpha = 0.75;
      fit(product.toUpperCase(), 400, height * 0.09, width * 0.62, 0.14);
      ctx.fillText(product.toUpperCase(), width / 2, height * 0.74);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  if (layout === "badge") {
    // Badges sit on a cylinder cap turned to face the camera; turn the print upright.
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
  }
  return texture;
}

export function createLabelMaterial(texture: Texture): MeshStandardMaterial {
  return new MeshStandardMaterial({
    map: texture,
    transparent: true,
    roughness: 0.35,
    metalness: 0.65,
    envMapIntensity: 1.6,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
  });
}
