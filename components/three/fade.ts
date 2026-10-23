import type { Material, Mesh, Object3D } from "three";

/**
 * Sets the opacity of everything under `root`. Materials are cloned the first
 * time a mesh needs to fade, so shared materials (and other products) are not
 * affected. Clones are collected in `clones` for disposal.
 */
export function applyOpacity(root: Object3D, opacity: number, clones: Material[]): void {
  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    if (!mesh.userData.fadeOwned) {
      if (opacity >= 1) return;
      const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const copies = originals.map((original) => {
        const copy = original.clone();
        copy.userData.baseOpacity = original.opacity;
        copy.userData.baseTransparent = original.transparent;
        clones.push(copy);
        return copy;
      });
      mesh.material = Array.isArray(mesh.material) ? copies : copies[0]!;
      mesh.userData.fadeOwned = true;
    }
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      const transparent = opacity < 1 || Boolean(material.userData.baseTransparent);
      if (material.transparent !== transparent) {
        material.transparent = transparent;
        material.needsUpdate = true;
      }
      material.opacity = ((material.userData.baseOpacity as number | undefined) ?? 1) * opacity;
    }
  });
}
