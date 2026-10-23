/** True if the browser can create a WebGL context. Runs in the browser only. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    const supported = Boolean(context);
    (context as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return supported;
  } catch {
    return false;
  }
}

/** True when the visitor's browser asks sites to use less data (Chrome "Lite"/Data Saver). */
export function prefersReducedData(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData) || window.matchMedia?.("(prefers-reduced-data: reduce)").matches === true;
}
