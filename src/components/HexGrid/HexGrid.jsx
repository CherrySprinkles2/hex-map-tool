import React, { useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import styled from 'styled-components';
import { setViewport, MIN_SCALE, MAX_SCALE } from '../../features/viewport/viewportSlice';
import { deselectTile, deselectArmy, setPlacingArmy, stopMovingArmy } from '../../features/ui/uiSlice';
import { getNeighbors, toKey } from './HexUtils';
import HexTile from './HexTile';
import GhostTile from './GhostTile';
import WaterOverlay from './WaterOverlay';
import ArmyToken from './ArmyToken';
import TerrainPatterns from './TerrainPatterns';

const SvgCanvas = styled.svg`
  flex: 1;
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
`;

const HexGrid = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const tiles = useSelector((state) => state.tiles);

  // Armies — only subscribed for rendering tokens; count is typically small
  const armies      = useSelector((state) => state.armies);
  const placingArmy = useSelector((state) => state.ui.placingArmy);

  // Group armies by tile key for stacking offset calculations
  const armiesByTile = useMemo(() => {
    const grouped = {};
    Object.values(armies).forEach((army) => {
      const key = toKey(army.q, army.r);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(army);
    });
    return grouped;
  }, [armies]);

  // ─── Viewport: managed imperatively to bypass React on every pan/zoom ──────
  // viewportRef is the live source of truth during interactions.
  // Redux viewport is only updated at the end of a drag or after each zoom tick
  // (for persistence), so HexGrid never re-renders due to viewport changes.
  const viewportRef = useRef({ x: 0, y: 0, scale: 1 });
  const groupRef    = useRef(null);

  const applyTransform = useCallback(() => {
    if (!groupRef.current) return;
    const { x, y, scale } = viewportRef.current;
    groupRef.current.setAttribute(
      'transform',
      `translate(${window.innerWidth / 2 + x}, ${window.innerHeight / 2 + y}) scale(${scale})`,
    );
  }, []);

  // Sync ref from Redux once on mount, then whenever Redux viewport changes
  // externally (e.g. resetViewport from Toolbar, or map switch).
  // store.subscribe avoids causing a React re-render — it's purely imperative.
  useLayoutEffect(() => {
    viewportRef.current = { ...store.getState().viewport };
    applyTransform();

    const unsubscribe = store.subscribe(() => {
      viewportRef.current = { ...store.getState().viewport };
      applyTransform();
    });
    return unsubscribe;
  }, [store, applyTransform]);

  // ─── Interaction refs ────────────────────────────────────────────────────────
  const dragging      = useRef(false);
  const lastPos       = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(null);

  // Commit current viewport ref to Redux (called at end of drag / after zoom).
  const commitViewport = useCallback(() => {
    dispatch(setViewport({ ...viewportRef.current }));
  }, [dispatch]);

  // ─── Mouse / touch handlers ──────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const focalX   = e.clientX - rect.left;
    const focalY   = e.clientY - rect.top;
    const svgWidth  = rect.width;
    const svgHeight = rect.height;

    const { x, y, scale } = viewportRef.current;
    const factor   = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    const tx = svgWidth  / 2 + x;
    const ty = svgHeight / 2 + y;
    const wx = (focalX - tx) / scale;
    const wy = (focalY - ty) / scale;

    viewportRef.current = {
      x: focalX - svgWidth  / 2 - wx * newScale,
      y: focalY - svgHeight / 2 - wy * newScale,
      scale: newScale,
    };
    applyTransform();
    commitViewport();
  }, [applyTransform, commitViewport]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    viewportRef.current.x += e.clientX - lastPos.current.x;
    viewportRef.current.y += e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    applyTransform();
  }, [applyTransform]);

  const handleMouseUp = useCallback(() => {
    if (dragging.current) {
      dragging.current = false;
      commitViewport();
    }
  }, [commitViewport]);

  const handleSvgClick = useCallback(() => {
    const ui = store.getState().ui;
    dispatch(deselectTile());
    if (ui.selectedArmyId) dispatch(deselectArmy());
    if (ui.placingArmy) dispatch(setPlacingArmy(false));
    if (ui.movingArmyId) dispatch(stopMovingArmy());
  }, [dispatch, store]);

  const handleTouchStart = useCallback((e) => {
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

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragging.current) {
      viewportRef.current.x += e.touches[0].clientX - lastPos.current.x;
      viewportRef.current.y += e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      applyTransform();
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist  = Math.hypot(dx, dy);
      const midX  = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY  = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect  = e.currentTarget.getBoundingClientRect();
      const focalX    = midX - rect.left;
      const focalY    = midY - rect.top;
      const svgWidth  = rect.width;
      const svgHeight = rect.height;
      const ratio = dist / lastPinchDist.current;

      const { x, y, scale } = viewportRef.current;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * ratio));
      const tx = svgWidth  / 2 + x;
      const ty = svgHeight / 2 + y;
      const wx = (focalX - tx) / scale;
      const wy = (focalY - ty) / scale;

      viewportRef.current = {
        x: focalX - svgWidth  / 2 - wx * newScale,
        y: focalY - svgHeight / 2 - wy * newScale,
        scale: newScale,
      };
      applyTransform();
      lastPinchDist.current = dist;
    }
  }, [applyTransform]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      dragging.current = false;
      lastPinchDist.current = null;
      commitViewport();
    } else if (e.touches.length === 1) {
      // Lifted one finger mid-pinch — resume single-finger pan
      lastPinchDist.current = null;
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      commitViewport();
    }
  }, [commitViewport]);

  // ─── Ghost tile keys ─────────────────────────────────────────────────────────
  const ghostKeys = useMemo(() => {
    const set = new Set();
    Object.values(tiles).forEach(({ q, r }) => {
      getNeighbors(q, r).forEach((n) => {
        const k = toKey(n.q, n.r);
        if (!tiles[k]) set.add(k);
      });
    });
    return set;
  }, [tiles]);

  return (
    <SvgCanvas
      style={{ cursor: placingArmy ? 'crosshair' : undefined }}
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
      {/* Pattern definitions — referenced by HexTile via fill="url(#pattern-TERRAIN)" */}
      <TerrainPatterns />

      {/* Transform is set imperatively via groupRef — no React re-render on pan/zoom */}
      <g ref={groupRef}>
        {/* Ghost tiles (behind real tiles) */}
        {[...ghostKeys].map((key) => {
          const [q, r] = key.split(',').map(Number);
          return <GhostTile key={`ghost-${key}`} q={q} r={r} />;
        })}

        {/* Real tiles */}
        {Object.values(tiles).map(({ q, r }) => (
          <HexTile key={toKey(q, r)} q={q} r={r} />
        ))}

        {/* Water connectivity overlay */}
        <WaterOverlay tiles={tiles} armiesByTile={armiesByTile} />

        {/* Army tokens — only on non-town tiles; towns show garrison visual instead */}
        {Object.entries(armiesByTile).map(([tileKey, tileArmies]) => {
          if (tiles[tileKey]?.hasTown) return null;
          return tileArmies.map((army, idx) => (
            <ArmyToken
              key={army.id}
              army={army}
              tileIndex={idx}
              total={tileArmies.length}
            />
          ));
        })}
      </g>
    </SvgCanvas>
  );
};

export default HexGrid;
