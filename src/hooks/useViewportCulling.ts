import { useState, useEffect, useRef } from 'react';
import { axialToPixel, HEX_SIZE } from '../utils/hexUtils';
import type { TilesState } from '../types/state';
import type { ViewportState } from '../types/state';

const FRAMES_PER_UPDATE = 4;
const SMALL_MAP_THRESHOLD = 500;
const DEFAULT_PADDING_TILES = 2;

/**
 * Returns the set of tile keys whose screen-space position falls within the SVG
 * viewport plus a padding margin. Updates via a throttled requestAnimationFrame
 * loop reading the live viewportRef so it stays accurate during pan/zoom without
 * needing Redux updates on every frame.
 *
 * On maps with fewer than SMALL_MAP_THRESHOLD tiles the full key set is returned
 * immediately and no rAF loop is started.
 */
const useViewportCulling = (
  viewportRef: React.RefObject<ViewportState | null>,
  svgRef: React.RefObject<SVGSVGElement | null>,
  tiles: TilesState,
  paddingTiles: number = DEFAULT_PADDING_TILES
): Set<string> => {
  const allKeys = Object.keys(tiles);
  const isSmallMap = allKeys.length < SMALL_MAP_THRESHOLD;

  const computeVisible = (): Set<string> => {
    const vp = viewportRef.current;
    const svg = svgRef.current;
    if (!vp || !svg) {
      return new Set(allKeys);
    }
    const { width, height } = svg.getBoundingClientRect();
    if (width === 0 || height === 0) {
      return new Set(allKeys);
    }
    const pad = paddingTiles * HEX_SIZE * Math.sqrt(3) * vp.scale;
    const visible = new Set<string>();
    for (const key of allKeys) {
      const tile = tiles[key];
      const { x: px, y: py } = axialToPixel(tile.q, tile.r);
      const screenX = width / 2 + vp.x + px * vp.scale;
      const screenY = height / 2 + vp.y + py * vp.scale;
      if (screenX > -pad && screenX < width + pad && screenY > -pad && screenY < height + pad) {
        visible.add(key);
      }
    }
    return visible;
  };

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(() => {
    if (isSmallMap) {
      return new Set(allKeys);
    }
    return computeVisible();
  });

  const frameCountRef = useRef(0);

  useEffect(() => {
    if (isSmallMap) {
      setVisibleKeys(new Set(Object.keys(tiles)));
      return;
    }

    // Seed synchronously so the first render is correct.
    setVisibleKeys(computeVisible());

    let rafId: number;

    const tick = () => {
      frameCountRef.current += 1;
      if (frameCountRef.current % FRAMES_PER_UPDATE === 0) {
        setVisibleKeys(computeVisible());
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, paddingTiles, isSmallMap]);

  if (isSmallMap) {
    return new Set(allKeys);
  }

  return visibleKeys;
};

export default useViewportCulling;
