import React, { useRef, useCallback, useMemo, useLayoutEffect, useEffect } from 'react';
import styled from 'styled-components';
import { setViewport, MIN_SCALE, MAX_SCALE } from '../../features/viewport/viewportSlice';
import {
  deselectTile,
  deselectArmy,
  setPlacingArmy,
  stopMovingArmy,
  exitTerrainPaint,
} from '../../features/ui/uiSlice';
import { getNeighbors, toKey } from '../../utils/hexUtils';
import { useAppDispatch, useAppSelector, useAppStore } from '../../app/hooks';
import HexTile from './HexTile';
import GhostTile from './GhostTile';
import WaterOverlay from './WaterOverlay';
import ArmyToken from './ArmyToken';
import TerrainPatterns from './TerrainPatterns';
import { PaintContext } from './PaintContext';
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
  const tiles = useAppSelector((state) => {
    return state.tiles;
  });

  const armies = useAppSelector((state) => {
    return state.armies;
  });
  const placingArmy = useAppSelector((state) => {
    return state.ui.placingArmy;
  });
  const mapMode = useAppSelector((state) => {
    return state.ui.mapMode;
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

  const commitViewport = useCallback(() => {
    dispatch(setViewport({ ...viewportRef.current }));
  }, [dispatch]);

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
      if (isPaintingRef.current) return;
      if (!dragging.current) return;
      viewportRef.current.x += e.clientX - lastPos.current.x;
      viewportRef.current.y += e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      applyTransform();
    },
    [applyTransform]
  );

  const handleMouseUp = useCallback(() => {
    isPaintingRef.current = false;
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
    if (Object.keys(tiles).length === 0) {
      set.add(toKey(0, 0));
      return set;
    }
    Object.values(tiles).forEach(({ q, r }) => {
      getNeighbors(q, r).forEach((n) => {
        const k = toKey(n.q, n.r);
        if (!tiles[k]) set.add(k);
      });
    });
    return set;
  }, [tiles]);

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
        <TerrainPatterns />

        <g ref={groupRef}>
          {[...ghostKeys].map((key) => {
            const [q, r] = key.split(',').map(Number);
            return <GhostTile key={`ghost-${key}`} q={q} r={r} />;
          })}

          {Object.values(tiles).map(({ q, r }) => {
            return <HexTile key={toKey(q, r)} q={q} r={r} />;
          })}

          <WaterOverlay tiles={tiles} armiesByTile={armiesByTile} />

          {Object.entries(armiesByTile).map(([tileKey, tileArmies]) => {
            if (tiles[tileKey]?.hasTown) return null;
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
