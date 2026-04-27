import React, { useRef, useCallback, useMemo, useLayoutEffect, useEffect } from 'react';
import styled from 'styled-components';
import { shallowEqual } from 'react-redux';
import { HexRenderer } from './canvas/HexRenderer';
import { hitTest, clientToWorld } from './canvas/hitTest';
import { setViewport, MIN_SCALE, MAX_SCALE } from '../../features/viewport/viewportSlice';
import {
  selectTile,
  deselectTile,
  selectArmy,
  deselectArmy,
  setPlacingArmy,
  startMovingArmy,
  stopMovingArmy,
  exitTerrainPaint,
} from '../../features/ui/uiSlice';
import {
  addTile,
  batchUpdateTiles,
  deleteTile,
  setTileFaction,
} from '../../features/tiles/tilesSlice';
import { addArmy, deleteArmy, moveArmy } from '../../features/armies/armiesSlice';
import { getNeighbors, toKey, pixelToAxial, hexLine, axialToPixel } from '../../utils/hexUtils';
import { inferTerrain } from '../../utils/inferTerrain';
import { registerViewportAnimator, unregisterViewportAnimator } from '../../utils/viewportAnimator';
import { theme } from '../../styles/theme';
import { useAppDispatch, useAppSelector, useAppStore } from '../../app/hooks';
import useViewportCulling from '../../hooks/useViewportCulling';
import type { TileFlag, TerrainType } from '../../types/domain';
import type { HexCoord } from '../../utils/hexUtils';
import type { ViewportState } from '../../types/state';

const GridContainer = styled.div`
  position: relative;
  flex: 1;
  display: block;
  min-height: 0;
  min-width: 0;
`;

const CanvasInteractionLayer = styled.div`
  position: absolute;
  inset: 0;
  touch-action: none;
`;

const HexCanvasLayer = styled.canvas`
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const HexGrid = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const tileKeys = useAppSelector((state) => {
    return Object.keys(state.tiles);
  }, shallowEqual);

  const placingArmy = useAppSelector((state) => {
    return state.ui.placingArmy;
  });
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
  });

  const viewportRef = useRef<ViewportState>({ x: 0, y: 0, scale: 1 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactionLayerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<HexRenderer | null>(null);

  const visibleKeys = useViewportCulling(viewportRef, containerRef, tileKeys);

  useLayoutEffect(() => {
    if (!canvasRef.current || !overlayCanvasRef.current) return;
    const renderer = new HexRenderer({ store, viewportRef });
    renderer.attach(canvasRef.current, overlayCanvasRef.current);
    rendererRef.current = renderer;
    return () => {
      renderer.detach();
      rendererRef.current = null;
    };
  }, [store]);

  useEffect(() => {
    rendererRef.current?.setVisibleKeys(visibleKeys);
  }, [visibleKeys]);

  const applyTransform = useCallback(() => {
    rendererRef.current?.onViewportChanged();
  }, []);

  useLayoutEffect(() => {
    viewportRef.current = { ...store.getState().viewport };
    applyTransform();

    const unsubscribe = store.subscribe(() => {
      viewportRef.current = { ...store.getState().viewport };
      applyTransform();
    });

    const measureEl = containerRef.current;
    let ro: ResizeObserver | undefined;
    if (measureEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        return applyTransform();
      });
      ro.observe(measureEl);
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
  const animRafRef = useRef<number | null>(null);

  const commitViewport = useCallback(() => {
    dispatch(setViewport({ ...viewportRef.current }));
  }, [dispatch]);

  useLayoutEffect(() => {
    const scrollTo = (worldX: number, worldY: number) => {
      if (animRafRef.current !== null) {
        cancelAnimationFrame(animRafRef.current);
        animRafRef.current = null;
      }

      const { x: startX, y: startY, scale } = viewportRef.current;
      const targetX = -worldX * scale;
      const targetY = -worldY * scale;
      const duration = 500;
      const startTime = performance.now();

      const tick = (now: number) => {
        const raw = Math.min((now - startTime) / duration, 1);
        const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;

        viewportRef.current = {
          x: startX + (targetX - startX) * t,
          y: startY + (targetY - startY) * t,
          scale,
        };
        applyTransform();

        if (raw < 1) {
          animRafRef.current = requestAnimationFrame(tick);
        } else {
          animRafRef.current = null;
          dispatch(setViewport({ x: targetX, y: targetY, scale }));
        }
      };

      animRafRef.current = requestAnimationFrame(tick);
    };

    registerViewportAnimator(scrollTo);
    return () => {
      return unregisterViewportAnimator();
    };
  }, [applyTransform, dispatch]);

  // Converts a screen-space position to hex coords and paints that tile (and all
  // tiles on the straight hex line from the last painted position to here, so fast
  // drags don't leave gaps).
  const applyBrushAtScreenPos = useCallback(
    (clientX: number, clientY: number) => {
      const measureEl = containerRef.current;
      if (!measureEl) return;
      const ui = store.getState().ui;
      if (ui.mapMode !== 'terrain-paint' && ui.mapMode !== 'faction') return;

      const rect = measureEl.getBoundingClientRect();
      const { x, y, scale } = viewportRef.current;
      const gridX = (clientX - rect.left - (rect.width / 2 + x)) / scale;
      const gridY = (clientY - rect.top - (rect.height / 2 + y)) / scale;
      const current = pixelToAxial(gridX, gridY);

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
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      const focalX = e.clientX - rect.left;
      const focalY = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      const { x, y, scale } = viewportRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
      const tx = width / 2 + x;
      const ty = height / 2 + y;
      const wx = (focalX - tx) / scale;
      const wy = (focalY - ty) / scale;

      viewportRef.current = {
        x: focalX - width / 2 - wx * newScale,
        y: focalY - height / 2 - wy * newScale,
        scale: newScale,
      };
      applyTransform();
      commitViewport();
    },
    [applyTransform, commitViewport]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (animRafRef.current !== null) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleBackgroundClear = useCallback(() => {
    const ui = store.getState().ui;
    if (ui.mapMode === 'terrain-paint') return;
    dispatch(deselectTile());
    if (ui.selectedArmyId) dispatch(deselectArmy());
    if (ui.placingArmy) dispatch(setPlacingArmy(false));
    if (ui.movingArmyId) dispatch(stopMovingArmy());
  }, [dispatch, store]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (animRafRef.current !== null) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }
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
    (e: React.TouchEvent<HTMLDivElement>) => {
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
        const width = rect.width;
        const height = rect.height;
        const ratio = dist / lastPinchDist.current;

        const { x, y, scale } = viewportRef.current;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * ratio));
        const tx = width / 2 + x;
        const ty = height / 2 + y;
        const wx = (focalX - tx) / scale;
        const wy = (focalY - ty) / scale;

        viewportRef.current = {
          x: focalX - width / 2 - wx * newScale,
          y: focalY - height / 2 - wy * newScale,
          scale: newScale,
        };
        applyTransform();
        lastPinchDist.current = dist;
      }
    },
    [applyTransform]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
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
    console.time('ghostKeys');
    const set = new Set<string>();
    if (tileKeys.length === 0) {
      set.add(toKey(0, 0));
      console.timeEnd('ghostKeys');
      return set;
    }
    const tileKeySet = new Set(tileKeys);
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
    console.timeEnd('ghostKeys');
    return set;
  }, [tileKeys, visibleKeys]);

  // Stable ref so canvas event handlers don't have to be recreated on every ghost change.
  const ghostKeysRef = useRef(ghostKeys);
  ghostKeysRef.current = ghostKeys;

  useEffect(() => {
    rendererRef.current?.setGhostKeys(ghostKeys);
  }, [ghostKeys]);

  // Test bridge: exposes the Redux store and synthetic-event helpers on window so
  // Playwright can interact with tiles/ghosts that have no DOM representation.
  // Tree-shaken out of production builds.
  useEffect(() => {
    if (import.meta.env.PROD) return;
    const tileClient = (q: number, r: number): { x: number; y: number } | null => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const { x: vx, y: vy, scale } = viewportRef.current;
      const { x: px, y: py } = axialToPixel(q, r);
      return {
        x: rect.left + rect.width / 2 + vx + px * scale,
        y: rect.top + rect.height / 2 + vy + py * scale,
      };
    };
    const fire = (type: string, q: number, r: number, init: MouseEventInit = {}): void => {
      const el = interactionLayerRef.current;
      const pt = tileClient(q, r);
      if (!el || !pt) return;
      el.dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: pt.x,
          clientY: pt.y,
          button: init.button ?? 0,
          ...init,
        })
      );
    };
    const firePointer = (type: string, q: number, r: number): void => {
      const el = interactionLayerRef.current;
      const pt = tileClient(q, r);
      if (!el || !pt) return;
      el.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: pt.x,
          clientY: pt.y,
          button: 0,
          pointerType: 'mouse',
        })
      );
    };
    (window as unknown as { __hexMapTest?: unknown }).__hexMapTest = {
      store,
      tileClient,
      clickTile: (q: number, r: number): void => {
        // Paint-mode clicks rely on pointerdown (which opens the paint stroke) —
        // fire pointerdown/up around the click so both paint and non-paint handlers fire.
        firePointer('pointerdown', q, r);
        firePointer('pointerup', q, r);
        fire('click', q, r);
      },
      rightClickTile: (q: number, r: number): void => {
        fire('contextmenu', q, r, { button: 2 });
      },
      firstGhostKey: (): string | null => {
        const iter = ghostKeysRef.current.values().next();
        return iter.done ? null : iter.value;
      },
      getTileKeys: (): string[] => {
        return Object.keys(store.getState().tiles);
      },
      getGhostKeys: (): string[] => {
        return Array.from(ghostKeysRef.current);
      },
      tileExists: (q: number, r: number): boolean => {
        return !!store.getState().tiles[toKey(q, r)];
      },
    };
    return () => {
      delete (window as unknown as { __hexMapTest?: unknown }).__hexMapTest;
    };
  }, [store]);

  const getHit = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const { worldX, worldY } = clientToWorld(clientX, clientY, rect, viewportRef.current);
      return hitTest({
        state: store.getState(),
        ghostKeys: ghostKeysRef.current,
        worldX,
        worldY,
      });
    },
    [store]
  );

  const handleCanvasPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const ui = store.getState().ui;
      if (ui.mapMode === 'terrain-paint') {
        if (!ui.activePaintBrush) return;
        isPaintingRef.current = true;
        applyBrushAtScreenPos(e.clientX, e.clientY);
      } else if (ui.mapMode === 'faction') {
        if (!ui.factionBrushActive) return;
        isPaintingRef.current = true;
        applyBrushAtScreenPos(e.clientX, e.clientY);
      }
    },
    [store, applyBrushAtScreenPos]
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const hit = getHit(e.clientX, e.clientY);
      if (!hit) return;
      if (hit.kind === 'tile' || hit.kind === 'ghost') {
        rendererRef.current?.setHoveredKey(hit.key);
      } else {
        rendererRef.current?.setHoveredKey(null);
      }
    },
    [getHit]
  );

  const handleCanvasPointerLeave = useCallback(() => {
    rendererRef.current?.setHoveredKey(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const state = store.getState();
      const ui = state.ui;
      if (ui.mapMode === 'terrain-paint') return;

      const hit = getHit(e.clientX, e.clientY);
      if (!hit) return;

      if (ui.mapMode === 'army') {
        if (hit.kind === 'army') {
          if (ui.movingArmyId === hit.army.id) {
            dispatch(stopMovingArmy());
            dispatch(deselectArmy());
          } else {
            dispatch(selectArmy(hit.army.id));
            dispatch(startMovingArmy(hit.army.id));
          }
          return;
        }
        if (hit.kind === 'tile') {
          if (ui.movingArmyId) {
            dispatch(moveArmy({ id: ui.movingArmyId, q: hit.q, r: hit.r }));
            dispatch(stopMovingArmy());
            dispatch(deselectArmy());
            return;
          }
          const armyOnTile = Object.values(state.armies).find((a) => {
            return a.q === hit.q && a.r === hit.r;
          });
          if (armyOnTile) {
            dispatch(selectArmy(armyOnTile.id));
            dispatch(startMovingArmy(armyOnTile.id));
          }
          return;
        }
        if (hit.kind === 'ghost') {
          if (ui.movingArmyId) {
            const terrain = inferTerrain(hit.q, hit.r, state.tiles);
            dispatch(addTile({ q: hit.q, r: hit.r, terrain }));
            dispatch(moveArmy({ id: ui.movingArmyId, q: hit.q, r: hit.r }));
            dispatch(stopMovingArmy());
            dispatch(deselectArmy());
          }
          return;
        }
        handleBackgroundClear();
        return;
      }

      if (hit.kind === 'army') {
        if (ui.selectedArmyId === hit.army.id) dispatch(deselectArmy());
        else dispatch(selectArmy(hit.army.id));
        return;
      }

      if (hit.kind === 'tile') {
        if (ui.mapMode === 'faction') {
          if (!ui.factionBrushActive) return;
          dispatch(setTileFaction({ q: hit.q, r: hit.r, factionId: ui.activeFactionId }));
          return;
        }
        if (ui.movingArmyId) {
          dispatch(moveArmy({ id: ui.movingArmyId, q: hit.q, r: hit.r }));
          dispatch(stopMovingArmy());
          return;
        }
        if (ui.placingArmy) {
          dispatch(addArmy({ q: hit.q, r: hit.r }));
          dispatch(setPlacingArmy(false));
          return;
        }
        if (ui.selectedTile === hit.key) {
          dispatch(deselectTile());
        } else {
          const hasTown = state.tiles[hit.key]?.hasTown ?? false;
          dispatch(selectTile({ key: hit.key, hasTown }));
        }
        return;
      }

      if (hit.kind === 'ghost') {
        const terrain = inferTerrain(hit.q, hit.r, state.tiles);
        if (ui.movingArmyId) {
          dispatch(addTile({ q: hit.q, r: hit.r, terrain }));
          dispatch(moveArmy({ id: ui.movingArmyId, q: hit.q, r: hit.r }));
          dispatch(stopMovingArmy());
          return;
        }
        if (ui.placingArmy) {
          dispatch(addTile({ q: hit.q, r: hit.r, terrain }));
          dispatch(addArmy({ q: hit.q, r: hit.r }));
          dispatch(setPlacingArmy(false));
          return;
        }
        if (ui.mapMode === 'faction') {
          if (!ui.factionBrushActive) return;
          dispatch(addTile({ q: hit.q, r: hit.r, terrain }));
          dispatch(setTileFaction({ q: hit.q, r: hit.r, factionId: ui.activeFactionId }));
          return;
        }
        dispatch(addTile({ q: hit.q, r: hit.r, terrain }));
        dispatch(selectTile({ key: toKey(hit.q, hit.r), hasTown: false }));
        return;
      }

      handleBackgroundClear();
    },
    [store, dispatch, getHit, handleBackgroundClear]
  );

  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const hit = getHit(e.clientX, e.clientY);
      if (!hit) return;
      const ui = store.getState().ui;

      if (hit.kind === 'army') {
        dispatch(deleteArmy(hit.army.id));
        dispatch(deselectArmy());
        return;
      }

      if (hit.kind === 'tile') {
        if (ui.selectedTile === hit.key) dispatch(deselectTile());
        dispatch(deleteTile({ q: hit.q, r: hit.r }));
      }
    },
    [getHit, dispatch, store]
  );

  return (
    <GridContainer ref={containerRef}>
      <HexCanvasLayer ref={canvasRef} />
      <HexCanvasLayer ref={overlayCanvasRef} />
      <CanvasInteractionLayer
        ref={interactionLayerRef}
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
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerLeave={handleCanvasPointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </GridContainer>
  );
};

export default HexGrid;
