import React, { useRef, useCallback, useMemo, useLayoutEffect, useEffect } from 'react';
import styled from 'styled-components';
import { shallowEqual } from 'react-redux';
import { setViewport, MIN_SCALE, MAX_SCALE } from '../../features/viewport/viewportSlice';
import {
  deselectTile,
  deselectArmy,
  setPlacingArmy,
  stopMovingArmy,
  exitTerrainPaint,
} from '../../features/ui/uiSlice';
import { addTile, batchUpdateTiles, setTileFaction } from '../../features/tiles/tilesSlice';
import {
  getNeighbors,
  toKey,
  pixelToAxial,
  hexLine,
  hexPointsString,
  axialToPixel,
  HEX_SIZE,
} from '../../utils/hexUtils';
import { theme } from '../../styles/theme';
import { useAppDispatch, useAppSelector, useAppStore } from '../../app/hooks';
import useViewportCulling from '../../hooks/useViewportCulling';
import HexTile from './HexTile';
import GhostTile from './GhostTile';
import WaterOverlay from './WaterOverlay';
import ArmyToken from './ArmyToken';
import TerrainPatterns from './TerrainPatterns';
import { PaintContext } from './PaintContext';
import type { TileFlag, TerrainType } from '../../types/domain';
import type { HexCoord } from '../../utils/hexUtils';
import type { Army } from '../../types/domain';
import type { ViewportState } from '../../types/state';

const SvgCanvas = styled.svg`
  flex: 1;
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
`;

const HexGrid = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  // Subscribe only to the set of tile keys — HexTile components subscribe to
  // their own data independently, so HexGrid only needs to re-render when tiles
  // are added or removed.
  const tileKeys = useAppSelector((state) => {
    return Object.keys(state.tiles);
  }, shallowEqual);

  const armies = useAppSelector((state) => {
    return state.armies;
  });
  const placingArmy = useAppSelector((state) => {
    return state.ui.placingArmy;
  });
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });
  const customTerrains = useAppSelector((state) => {
    return state.terrainConfig.custom;
  });

  const selectedTile = useAppSelector((state) => {
    return state.ui.selectedTile;
  });

  const armiesByTile = useMemo(() => {
    const grouped: Record<string, Army[]> = {};
    Object.values(armies).forEach((army) => {
      const key = toKey(army.q, army.r);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(army);
    });
    return grouped;
  }, [armies]);

  const viewportRef = useRef<ViewportState>({ x: 0, y: 0, scale: 1 });
  const groupRef = useRef<SVGGElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const visibleKeys = useViewportCulling(viewportRef, svgRef, tileKeys);

  const applyTransform = useCallback(() => {
    if (!groupRef.current || !svgRef.current) return;
    const { x, y, scale } = viewportRef.current;
    const { width, height } = svgRef.current.getBoundingClientRect();
    groupRef.current.setAttribute(
      'transform',
      `translate(${width / 2 + x}, ${height / 2 + y}) scale(${scale})`
    );
  }, []);

  useLayoutEffect(() => {
    viewportRef.current = { ...store.getState().viewport };
    applyTransform();

    const unsubscribe = store.subscribe(() => {
      viewportRef.current = { ...store.getState().viewport };
      applyTransform();
    });

    let ro: ResizeObserver | undefined;
    if (svgRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        return applyTransform();
      });
      ro.observe(svgRef.current);
    }

    return () => {
      unsubscribe();
      ro?.disconnect();
    };
  }, [store, applyTransform]);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);
  const isPaintingRef = useRef(false);
  const lastPaintedPosRef = useRef<HexCoord | null>(null);

  const commitViewport = useCallback(() => {
    dispatch(setViewport({ ...viewportRef.current }));
  }, [dispatch]);

  // Converts a screen-space position to hex coords and paints that tile (and all
  // tiles on the straight hex line from the last painted position to here, so fast
  // drags don't leave gaps).
  const applyBrushAtScreenPos = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return;
      const ui = store.getState().ui;
      if (ui.mapMode !== 'terrain-paint' && ui.mapMode !== 'faction') return;

      const rect = svgRef.current.getBoundingClientRect();
      const { x, y, scale } = viewportRef.current;
      const gridX = (clientX - rect.left - (rect.width / 2 + x)) / scale;
      const gridY = (clientY - rect.top - (rect.height / 2 + y)) / scale;
      const current = pixelToAxial(gridX, gridY);

      // Interpolate from last painted position so no tiles are skipped
      const prev = lastPaintedPosRef.current;
      const coords = prev ? hexLine(prev.q, prev.r, current.q, current.r) : [current];

      lastPaintedPosRef.current = current;

      const tilesState = store.getState().tiles;

      if (ui.mapMode === 'faction') {
        const ops: Array<{ type: 'faction'; q: number; r: number; factionId: string | null }> = [];
        coords.forEach(({ q, r }) => {
          if (tilesState[toKey(q, r)]) {
            ops.push({ type: 'faction', q, r, factionId: ui.activeFactionId });
          }
        });
        if (ops.length > 0) dispatch(batchUpdateTiles(ops));
        return;
      }

      // terrain-paint mode
      const brush = ui.activePaintBrush;
      if (!brush) return;

      const isTerrainBrush =
        !!theme.terrain[brush as keyof typeof theme.terrain] ||
        store.getState().terrainConfig.custom.some((ct) => {
          return ct.id === brush;
        });

      type BatchOp =
        | { type: 'add'; q: number; r: number; terrain: string }
        | { type: 'update'; q: number; r: number; terrain: string }
        | { type: 'feature'; q: number; r: number; flag: TileFlag; value: boolean };

      const ops: BatchOp[] = [];

      coords.forEach(({ q, r }) => {
        const tileExists = !!tilesState[toKey(q, r)];

        if (isTerrainBrush) {
          if (!tileExists) {
            ops.push({ type: 'add', q, r, terrain: brush as TerrainType });
          } else {
            ops.push({ type: 'update', q, r, terrain: brush });
          }
        } else if (!tileExists) {
          return;
        } else if (brush === 'river-on') {
          ops.push({ type: 'feature', q, r, flag: 'hasRiver' as TileFlag, value: true });
        } else if (brush === 'river-off') {
          ops.push({ type: 'feature', q, r, flag: 'hasRiver' as TileFlag, value: false });
        } else if (brush === 'road-on') {
          ops.push({ type: 'feature', q, r, flag: 'hasRoad' as TileFlag, value: true });
        } else if (brush === 'road-off') {
          ops.push({ type: 'feature', q, r, flag: 'hasRoad' as TileFlag, value: false });
        }
      });

      if (ops.length > 0) dispatch(batchUpdateTiles(ops));
    },
    [dispatch, store]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const focalX = e.clientX - rect.left;
      const focalY = e.clientY - rect.top;
      const svgWidth = rect.width;
      const svgHeight = rect.height;

      const { x, y, scale } = viewportRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
      const tx = svgWidth / 2 + x;
      const ty = svgHeight / 2 + y;
      const wx = (focalX - tx) / scale;
      const wy = (focalY - ty) / scale;

      viewportRef.current = {
        x: focalX - svgWidth / 2 - wx * newScale,
        y: focalY - svgHeight / 2 - wy * newScale,
        scale: newScale,
      };
      applyTransform();
      commitViewport();
    },
    [applyTransform, commitViewport]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (isPaintingRef.current) {
        applyBrushAtScreenPos(e.clientX, e.clientY);
        return;
      }
      if (!dragging.current) return;
      viewportRef.current.x += e.clientX - lastPos.current.x;
      viewportRef.current.y += e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      applyTransform();
    },
    [applyTransform, applyBrushAtScreenPos]
  );

  const handleMouseUp = useCallback(() => {
    isPaintingRef.current = false;
    lastPaintedPosRef.current = null;
    if (dragging.current) {
      dragging.current = false;
      commitViewport();
    }
  }, [commitViewport]);

  const handleSvgClick = useCallback(() => {
    const ui = store.getState().ui;
    if (ui.mapMode === 'terrain-paint') return;
    dispatch(deselectTile());
    if (ui.selectedArmyId) dispatch(deselectArmy());
    if (ui.placingArmy) dispatch(setPlacingArmy(false));
    if (ui.movingArmyId) dispatch(stopMovingArmy());
  }, [dispatch, store]);

  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      dragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (e.touches.length === 1 && dragging.current) {
        viewportRef.current.x += e.touches[0].clientX - lastPos.current.x;
        viewportRef.current.y += e.touches[0].clientY - lastPos.current.y;
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        applyTransform();
      } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = e.currentTarget.getBoundingClientRect();
        const focalX = midX - rect.left;
        const focalY = midY - rect.top;
        const svgWidth = rect.width;
        const svgHeight = rect.height;
        const ratio = dist / lastPinchDist.current;

        const { x, y, scale } = viewportRef.current;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * ratio));
        const tx = svgWidth / 2 + x;
        const ty = svgHeight / 2 + y;
        const wx = (focalX - tx) / scale;
        const wy = (focalY - ty) / scale;

        viewportRef.current = {
          x: focalX - svgWidth / 2 - wx * newScale,
          y: focalY - svgHeight / 2 - wy * newScale,
          scale: newScale,
        };
        applyTransform();
        lastPinchDist.current = dist;
      }
    },
    [applyTransform]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (e.touches.length === 0) {
        dragging.current = false;
        lastPinchDist.current = null;
        commitViewport();
      } else if (e.touches.length === 1) {
        lastPinchDist.current = null;
        dragging.current = true;
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        commitViewport();
      }
    },
    [commitViewport]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (store.getState().ui.mapMode === 'terrain-paint') {
        dispatch(exitTerrainPaint());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, store]);

  const ghostKeys = useMemo(() => {
    const set = new Set<string>();
    if (tileKeys.length === 0) {
      set.add(toKey(0, 0));
      return set;
    }
    const tileKeySet = new Set(tileKeys);
    // Only compute ghosts for visible tiles to avoid off-screen ghost accumulation.
    visibleKeys.forEach((key) => {
      if (!tileKeySet.has(key)) return;
      const [qStr, rStr] = key.split(',');
      const q = Number(qStr);
      const r = Number(rStr);
      getNeighbors(q, r).forEach((n) => {
        const k = toKey(n.q, n.r);
        if (!tileKeySet.has(k)) set.add(k);
      });
    });
    return set;
  }, [tileKeys, visibleKeys]);

  return (
    <PaintContext.Provider value={isPaintingRef}>
      <SvgCanvas
        ref={svgRef}
        style={{
          cursor:
            placingArmy || mapMode === 'terrain-paint' || mapMode === 'faction'
              ? 'crosshair'
              : undefined,
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TerrainPatterns customTerrains={customTerrains} />

        <g ref={groupRef} style={{ willChange: 'transform' }}>
          {[...ghostKeys].map((key) => {
            const [q, r] = key.split(',').map(Number);
            return <GhostTile key={`ghost-${key}`} q={q} r={r} />;
          })}

          {tileKeys
            .filter((key) => {
              return visibleKeys.has(key);
            })
            .map((key) => {
              const [qStr, rStr] = key.split(',');
              return <HexTile key={key} q={Number(qStr)} r={Number(rStr)} />;
            })}

          <WaterOverlay visibleKeys={visibleKeys} armiesByTile={armiesByTile} />

          {(() => {
            if (!selectedTile) return null;
            const [sqStr, srStr] = selectedTile.split(',');
            const sq = Number(sqStr);
            const sr = Number(srStr);
            const { x: sx, y: sy } = axialToPixel(sq, sr);
            const selPts = hexPointsString(sx, sy, HEX_SIZE - 5);
            return (
              <polygon
                points={selPts}
                fill="none"
                stroke={theme.selectedStroke}
                strokeWidth={2.5}
                strokeDasharray="6 3"
                strokeLinecap="round"
                style={{ animation: 'marchingAnts 1s linear infinite', pointerEvents: 'none' }}
              />
            );
          })()}

          {Object.entries(armiesByTile)
            .filter(([tileKey]) => {
              return visibleKeys.has(tileKey);
            })
            .map(([tileKey, tileArmies]) => {
              const hasTown = store.getState().tiles[tileKey]?.hasTown;
              if (hasTown) return null;
              return tileArmies.map((army, idx) => {
                return (
                  <ArmyToken key={army.id} army={army} tileIndex={idx} total={tileArmies.length} />
                );
              });
            })}
        </g>
      </SvgCanvas>
    </PaintContext.Provider>
  );
};

export default HexGrid;
