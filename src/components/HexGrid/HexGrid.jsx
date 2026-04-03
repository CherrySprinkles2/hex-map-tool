import React, { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { pan, zoom } from '../../features/viewport/viewportSlice';
import { deselectTile } from '../../features/ui/uiSlice';
import { getNeighbors, toKey } from './HexUtils';
import HexTile from './HexTile';
import GhostTile from './GhostTile';
import WaterOverlay from './WaterOverlay';
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
  const tiles = useSelector((state) => state.tiles);
  const { x, y, scale } = useSelector((state) => state.viewport);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  // For pinch-to-zoom: track last distance between two touch points
  const lastPinchDist = useRef(null);

  // Compute ghost tile positions: neighbours of existing tiles that are empty
  const ghostKeys = new Set();
  Object.values(tiles).forEach(({ q, r }) => {
    getNeighbors(q, r).forEach((n) => {
      const k = toKey(n.q, n.r);
      if (!tiles[k]) ghostKeys.add(k);
    });
  });

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    dispatch(zoom({
      delta: e.deltaY,
      focalX: e.clientX - rect.left,
      focalY: e.clientY - rect.top,
      svgWidth: rect.width,
      svgHeight: rect.height,
    }));
  }, [dispatch]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    dispatch(pan({ dx, dy }));
  }, [dispatch]);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleSvgClick = useCallback(() => {
    dispatch(deselectTile());
  }, [dispatch]);

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
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dispatch(pan({ dx, dy }));
    } else if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const rect = e.currentTarget.getBoundingClientRect();
      // Convert pinch distance change into a zoom delta (negative = zoom in)
      const delta = (lastPinchDist.current - dist) * 3;
      dispatch(zoom({
        delta,
        focalX: midX - rect.left,
        focalY: midY - rect.top,
        svgWidth: rect.width,
        svgHeight: rect.height,
      }));
      lastPinchDist.current = dist;
    }
  }, [dispatch]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      dragging.current = false;
      lastPinchDist.current = null;
    } else if (e.touches.length === 1) {
      // Lifted one finger mid-pinch — resume single-finger pan
      lastPinchDist.current = null;
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  return (
    <SvgCanvas
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

      {/* Center the grid in the viewport */}
      <g transform={`translate(${window.innerWidth / 2 + x}, ${window.innerHeight / 2 + y}) scale(${scale})`}>
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
        <WaterOverlay tiles={tiles} />
      </g>
    </SvgCanvas>
  );
};

export default HexGrid;
