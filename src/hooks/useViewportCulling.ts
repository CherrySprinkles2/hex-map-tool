import { useState, useEffect, useRef, useCallback } from 'react';
import { axialToPixel, HEX_SIZE } from '../utils/hexUtils';
import type { ViewportState } from '../types/state';

const FRAMES_PER_UPDATE = 4;
const SMALL_MAP_THRESHOLD = 500;
const DEFAULT_PADDING_TILES = 2;

/** Returns true if two Sets contain the same elements. */
const setsEqual = (a: Set<string>, b: Set<string>): boolean => {
  if (a.size !== b.size) return false;
  for (const key of a) {
    if (!b.has(key)) return false;
  }
  return true;
};

/**
 * Returns the set of tile keys whose screen-space position falls within the SVG
 * viewport plus a padding margin. Updates via a throttled requestAnimationFrame
 * loop reading the live viewportRef so it stays accurate during pan/zoom without
 * needing Redux updates on every frame.
 *
 * The returned Set reference is stable — it only changes when the visible tile
 * set actually differs, preventing unnecessary downstream re-renders.
 *
 * Accepts an array of tile key strings (not the full tiles state) so the rAF loop
 * only restarts when tiles are added or removed, not on every tile data mutation.
 *
 * On maps with fewer than SMALL_MAP_THRESHOLD tiles the full key set is returned
 * immediately and no rAF loop is started.
 */
const useViewportCulling = (
  viewportRef: React.RefObject<ViewportState | null>,
  svgRef: React.RefObject<SVGSVGElement | null>,
  tileKeys: string[],
  paddingTiles: number = DEFAULT_PADDING_TILES
): Set<string> => {
  const isSmallMap = tileKeys.length < SMALL_MAP_THRESHOLD;

  const computeVisible = useCallback(
    (keys: string[]): Set<string> => {
      const vp = viewportRef.current;
      const svg = svgRef.current;
      if (!vp || !svg) {
        return new Set(keys);
      }
      const { width, height } = svg.getBoundingClientRect();
      if (width === 0 || height === 0) {
        return new Set(keys);
      }
      const pad = paddingTiles * HEX_SIZE * Math.sqrt(3) * vp.scale;
      const visible = new Set<string>();
      for (const key of keys) {
        const [qStr, rStr] = key.split(',');
        const { x: px, y: py } = axialToPixel(Number(qStr), Number(rStr));
        const screenX = width / 2 + vp.x + px * vp.scale;
        const screenY = height / 2 + vp.y + py * vp.scale;
        if (screenX > -pad && screenX < width + pad && screenY > -pad && screenY < height + pad) {
          visible.add(key);
        }
      }
      return visible;
    },
    [viewportRef, svgRef, paddingTiles]
  );

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(() => {
    if (isSmallMap) {
      return new Set(tileKeys);
    }
    // Try to compute visible tiles immediately. If the SVG hasn't been laid out
    // yet (width/height === 0), start with an empty set so we don't mount all
    // tiles on the first frame — the rAF loop will populate it once layout is ready.
    const initial = computeVisible(tileKeys);
    if (initial.size === tileKeys.length && tileKeys.length >= SMALL_MAP_THRESHOLD) {
      return new Set<string>();
    }
    return initial;
  });

  // Keep a ref to the latest tileKeys so the rAF tick always uses the current
  // set without restarting the loop on every change.
  const tileKeysRef = useRef(tileKeys);
  tileKeysRef.current = tileKeys;

  // Track the last visible set to avoid producing a new Set reference when
  // the contents haven't changed (e.g. panning within the same area).
  const lastVisibleRef = useRef(visibleKeys);

  const frameCountRef = useRef(0);

  useEffect(() => {
    if (isSmallMap) {
      setVisibleKeys((prev) => {
        const next = new Set(tileKeys);
        if (setsEqual(prev, next)) return prev;
        lastVisibleRef.current = next;
        return next;
      });
      return;
    }

    // Seed synchronously so the first render after mount is correct.
    const seeded = computeVisible(tileKeys);
    if (!setsEqual(lastVisibleRef.current, seeded)) {
      lastVisibleRef.current = seeded;
      setVisibleKeys(seeded);
    }

    let rafId: number;

    const tick = () => {
      frameCountRef.current += 1;
      if (frameCountRef.current % FRAMES_PER_UPDATE === 0) {
        const next = computeVisible(tileKeysRef.current);
        if (!setsEqual(lastVisibleRef.current, next)) {
          lastVisibleRef.current = next;
          setVisibleKeys(next);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileKeys, paddingTiles, isSmallMap, computeVisible]);

  return visibleKeys;
};

export default useViewportCulling;
