import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { brandRegistry } from "@/brands";
import { parseBrandBundle } from "@/lib/brand";

const assetPattern = /^\/[A-Za-z0-9_\-./]+\.(webp|avif|png|jpe?g|svg|gif|glb|gltf|mp3|mp4|webm|woff2?)$/;

/** Every string in the brand data that looks like a file under /public. */
function collectAssetPaths(value: unknown, found = new Set<string>()): Set<string> {
  if (typeof value === "string" && assetPattern.test(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collectAssetPaths(item, found));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectAssetPaths(item, found));
  return found;
}

describe.each(Object.entries(brandRegistry))("%s assets (TRD §52)", (key, raw) => {
  const bundle = parseBrandBundle(raw, key);
  const paths = [...collectAssetPaths(bundle)];

  it("references at least the fonts and product images", () => {
    expect(paths.length).toBeGreaterThan(3);
  });

  it.each(paths)("%s exists in /public", (path) => {
    expect(existsSync(join(process.cwd(), "public", path))).toBe(true);
  });

  it("stores assets under the brand's own folder or the shared folders", () => {
    for (const path of paths) {
      expect(path.startsWith(`/brands/${key}/`) || path.startsWith("/fonts/") || path.startsWith("/textures/")).toBe(true);
    }
  });
});
