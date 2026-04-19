// Module-level cache that rasterizes SVG assets (imported as URLs) into
// offscreen <canvas> elements at arbitrary pixel sizes. Consumers call the
// synchronous getters; if the asset hasn't loaded yet the getter returns
// null and triggers an async load. When the load finishes, every registered
// repaint callback fires so the renderer can paint the now-ready asset.
//
// Why a module-level cache: the same SVG is often used at the same size
// across the app (e.g., all village icons render at 60 px). Caching per
// `{url}@{w}x{h}[#tint]` key avoids re-rasterising on every paint.

type RepaintCallback = () => void;

const canvasCache = new Map<string, HTMLCanvasElement>();
const imageCache = new Map<string, HTMLImageElement>();
const loadingUrls = new Set<string>();
const repaintCallbacks = new Set<RepaintCallback>();

const notifyRepaints = (): void => {
  repaintCallbacks.forEach((cb) => {
    cb();
  });
};

export const registerRepaintOnLoad = (cb: RepaintCallback): (() => void) => {
  repaintCallbacks.add(cb);
  return function unregister() {
    repaintCallbacks.delete(cb);
  };
};

const ensureImage = (url: string): HTMLImageElement | null => {
  const cached = imageCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) return cached;
  if (loadingUrls.has(url)) return null;
  loadingUrls.add(url);
  const img = new Image();
  img.onload = () => {
    imageCache.set(url, img);
    loadingUrls.delete(url);
    notifyRepaints();
  };
  img.onerror = () => {
    loadingUrls.delete(url);
  };
  img.src = url;
  return null;
};

const rasterize = (img: HTMLImageElement, w: number, h: number): HTMLCanvasElement | null => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * Returns a canvas-rasterised copy of `url` at (w, h), or null if the image is
 * still loading. Safe to call every paint — cheap cache lookup once loaded.
 */
export const getSvgCanvas = (url: string, w: number, h: number): HTMLCanvasElement | null => {
  const key = `${url}@${Math.round(w)}x${Math.round(h)}`;
  const cached = canvasCache.get(key);
  if (cached) return cached;
  const img = ensureImage(url);
  if (!img) return null;
  const canvas = rasterize(img, w, h);
  if (!canvas) return null;
  canvasCache.set(key, canvas);
  return canvas;
};

/**
 * Like getSvgCanvas, but recolors every opaque pixel to `tint` via source-in.
 * Used for custom terrains — a single mark colour replaces the SVG's native
 * palette while preserving alpha falloff.
 */
export const getTintedSvgCanvas = (
  url: string,
  w: number,
  h: number,
  tint: string
): HTMLCanvasElement | null => {
  const key = `${url}@${Math.round(w)}x${Math.round(h)}#${tint}`;
  const cached = canvasCache.get(key);
  if (cached) return cached;
  const base = getSvgCanvas(url, w, h);
  if (!base) return null;
  const canvas = document.createElement('canvas');
  canvas.width = base.width;
  canvas.height = base.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(base, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCache.set(key, canvas);
  return canvas;
};

/** Eagerly start loading a list of URLs. Useful to warm the cache on app boot. */
export const preloadSvgs = (urls: readonly string[]): void => {
  urls.forEach((url) => {
    ensureImage(url);
  });
};
