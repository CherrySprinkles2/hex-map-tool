import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { axialToPixel, toKey, buildDeepWaterSet, HEX_SIZE } from '../../utils/hexUtils';
import { theme } from '../../styles/theme';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setArmySubTilePosition, setArmyInsideTown } from '../../features/armies/armiesSlice';
import { createPatternCache } from '../HexGrid/canvas/patternCache';
import type { PatternCache } from '../HexGrid/canvas/patternCache';
import { registerRepaintOnLoad } from '../../utils/svgCache';
import { drawTiles } from '../HexGrid/canvas/drawTiles';
import { drawRivers } from '../HexGrid/canvas/drawRivers';
import { drawRoads } from '../HexGrid/canvas/drawRoads';
import { drawCauseways } from '../HexGrid/canvas/drawCauseways';
import { drawTowns } from '../HexGrid/canvas/drawTowns';
import { drawPorts } from '../HexGrid/canvas/drawPorts';
import { drawLabels } from '../HexGrid/canvas/drawLabels';
import type { Tile, Army, Faction, TownSize } from '../../types/domain';

const BASE_CANVAS_SIZE = 380;
const BASE_HEX_SIZE = 150;
const BASE_TOKEN_RADIUS = 16;

interface DragState {
  armyId: string;
  x: number;
  y: number;
}

interface Props {
  tile: Tile;
  armies: Army[];
  factions: Faction[];
  canvasSize?: number;
}

const StyledCanvas = styled.canvas<{ $size: number }>`
  display: block;
  width: ${({ $size }) => {
    return $size;
  }}px;
  height: ${({ $size }) => {
    return $size;
  }}px;
  max-width: 100%;
  border-radius: 8px;
  touch-action: none;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: ${({ theme: t }) => {
    return t.textMuted;
  }};
  text-align: center;
  line-height: 1.4;
`;

const TileArrangeCanvas = ({
  tile,
  armies,
  factions,
  canvasSize = BASE_CANVAS_SIZE,
}: Props): React.ReactElement => {
  const dispatch = useAppDispatch();
  const tiles = useAppSelector((s) => {
    return s.tiles;
  });
  const customTerrains = useAppSelector((s) => {
    return s.terrainConfig.custom;
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternCacheRef = useRef<PatternCache | null>(null);
  const [repaintToken, setRepaintToken] = useState(0);

  const sizeScale = canvasSize / BASE_CANVAS_SIZE;
  const CENTER = canvasSize / 2;
  const MODAL_HEX_SIZE = BASE_HEX_SIZE * sizeScale;
  const SCALE = MODAL_HEX_SIZE / HEX_SIZE;
  const TOKEN_RADIUS = BASE_TOKEN_RADIUS * sizeScale;
  const MAX_DIST = MODAL_HEX_SIZE * 0.88;

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const init: Record<string, { x: number; y: number }> = {};
    armies.forEach((army) => {
      if (army.subTileX !== undefined && army.subTileY !== undefined) {
        init[army.id] = {
          x: CENTER + army.subTileX * SCALE,
          y: CENTER + army.subTileY * SCALE,
        };
      }
    });
    return init;
  });

  const [dragState, setDragState] = useState<DragState | null>(null);

  const getDisplayPos = useCallback(
    (army: Army, idx: number): { x: number; y: number } => {
      if (dragState?.armyId === army.id) {
        return { x: dragState.x, y: dragState.y };
      }
      const stored = positions[army.id];
      if (stored) {
        return stored;
      }
      return {
        x: CENTER + (idx - (armies.length - 1) / 2) * theme.army.stackSpacing * SCALE,
        y: CENTER - 8 * SCALE,
      };
    },
    [dragState, positions, armies.length, CENTER, SCALE]
  );

  // Recompute canvas-pixel positions when canvasSize changes.
  useEffect(() => {
    setPositions(() => {
      const recomputed: Record<string, { x: number; y: number }> = {};
      armies.forEach((army) => {
        if (army.subTileX !== undefined && army.subTileY !== undefined) {
          recomputed[army.id] = {
            x: CENTER + army.subTileX * SCALE,
            y: CENTER + army.subTileY * SCALE,
          };
        }
      });
      return recomputed;
    });
  }, [canvasSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register SVG load callback once — triggers repaint when assets arrive.
  useEffect(() => {
    const unsub = registerRepaintOnLoad(() => {
      patternCacheRef.current?.refresh();
      setRepaintToken((t) => {
        return t + 1;
      });
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Lazily create / reuse the pattern cache for this canvas context.
    if (!patternCacheRef.current) {
      patternCacheRef.current = createPatternCache(ctx);
    }
    patternCacheRef.current.syncCustom(customTerrains);

    const dpr = window.devicePixelRatio || 1;
    const phys = Math.round(canvasSize * dpr);
    if (canvas.width !== phys) canvas.width = phys;
    if (canvas.height !== phys) canvas.height = phys;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, phys, phys);

    // ── Tile layers — same draw modules and viewport transform as HexRenderer ──
    // Center the tile at (CENTER, CENTER) by offsetting the transform by the
    // tile's world-space position, matching applyViewportTransform in HexRenderer.
    const { x: wx, y: wy } = axialToPixel(tile.q, tile.r);
    const hexScale = dpr * SCALE;
    ctx.setTransform(
      hexScale,
      0,
      0,
      hexScale,
      dpr * (CENTER - SCALE * wx),
      dpr * (CENTER - SCALE * wy)
    );

    const tileKey = toKey(tile.q, tile.r);
    const iterateKeys = new Set([tileKey]);
    const deepWaterSet = buildDeepWaterSet(customTerrains);

    drawTiles({
      ctx,
      tiles,
      visibleKeys: iterateKeys,
      customTerrains,
      factions,
      theme,
      patternCache: patternCacheRef.current,
      mapMode: 'terrain',
      hoveredKey: null,
    });

    const riverCurvesByTile = drawRivers({ ctx, tiles, iterateKeys, deepWaterSet, theme });
    drawRoads({ ctx, tiles, iterateKeys, deepWaterSet, riverCurvesByTile, theme });
    drawCauseways({ ctx, tiles, iterateKeys, deepWaterSet, theme });
    drawTowns({ ctx, tiles, iterateKeys, deepWaterSet, theme });
    drawPorts({ ctx, tiles, iterateKeys, deepWaterSet, theme });
    drawLabels({ ctx, tiles, iterateKeys, deepWaterSet, theme });

    // ── Reset to DPR-only transform for CSS-space army rendering ─────────────
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Garrison zone indicator (modal-specific UI to mark the town interior)
    if (tile.hasTown) {
      const townSize = (tile.townSize ?? 'town') as TownSize;
      const townRadius = theme.town.size[townSize].radius * SCALE;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, townRadius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('inside', CENTER, CENTER + townRadius + 16);
      ctx.restore();
    }

    // ── Interactive army tokens (draggable, always-labelled) ─────────────────
    const factionColorMap: Record<string, string> = {};
    factions.forEach((f) => {
      factionColorMap[f.id] = f.color;
    });

    armies.forEach((army, idx) => {
      const { x: ax, y: ay } = getDisplayPos(army, idx);

      const insideTown = (() => {
        if (!tile.hasTown) return false;
        const storedX = (ax - CENTER) / SCALE;
        const storedY = (ay - CENTER) / SCALE;
        const innerR = theme.town.size[(tile.townSize ?? 'town') as TownSize].radius;
        return Math.sqrt(storedX * storedX + storedY * storedY) < innerR;
      })();

      // Garrison dashed ring
      if (insideTown) {
        ctx.save();
        ctx.strokeStyle = theme.garrison.borderColor;
        ctx.lineWidth = theme.garrison.borderWidth;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(ax, ay, TOKEN_RADIUS + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Token circle
      ctx.beginPath();
      ctx.arc(ax, ay, TOKEN_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = theme.army.tokenFill;
      ctx.fill();
      ctx.strokeStyle = theme.army.tokenStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Faction dot
      const factionColor = army.factionId ? factionColorMap[army.factionId] : null;
      if (factionColor) {
        const dx = ax + TOKEN_RADIUS * 0.65;
        const dy = ay + TOKEN_RADIUS * 0.65;
        ctx.beginPath();
        ctx.arc(dx, dy, 5, 0, Math.PI * 2);
        ctx.fillStyle = factionColor;
        ctx.fill();
        ctx.strokeStyle = theme.army.tokenFill;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Name label (always shown in modal)
      if (army.name) {
        const labelY = ay + TOKEN_RADIUS + 11;
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = theme.army.labelStroke;
        ctx.strokeText(army.name, ax, labelY);
        ctx.fillStyle = theme.army.labelFill;
        ctx.fillText(army.name, ax, labelY);
      }
    });
  }, [
    tile,
    armies,
    factions,
    positions,
    dragState,
    getDisplayPos,
    repaintToken,
    tiles,
    customTerrains,
    canvasSize,
    CENTER,
    MODAL_HEX_SIZE,
    SCALE,
    TOKEN_RADIUS,
  ]);

  const getCanvasPos = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: CENTER, y: CENTER };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvasSize / rect.width),
        y: (e.clientY - rect.top) * (canvasSize / rect.height),
      };
    },
    [canvasSize, CENTER]
  );

  const clampToHex = (rawX: number, rawY: number): { x: number; y: number } => {
    const dist = Math.sqrt(rawX * rawX + rawY * rawY);
    const s = dist > MAX_DIST ? MAX_DIST / dist : 1;
    return { x: rawX * s, y: rawY * s };
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;
      const { x: px, y: py } = getCanvasPos(e);

      let hitArmy: Army | null = null;
      for (let i = armies.length - 1; i >= 0; i--) {
        const army = armies[i];
        const { x: ax, y: ay } = getDisplayPos(army, i);
        const dx = px - ax;
        const dy = py - ay;
        if (dx * dx + dy * dy <= (TOKEN_RADIUS + 4) * (TOKEN_RADIUS + 4)) {
          hitArmy = army;
          break;
        }
      }

      if (!hitArmy) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragState({ armyId: hitArmy.id, x: px, y: py });
    },
    [armies, getDisplayPos, getCanvasPos]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dragState) return;
      const { x: px, y: py } = getCanvasPos(e);
      const rawX = px - CENTER;
      const rawY = py - CENTER;
      const clamped = clampToHex(rawX, rawY);
      setDragState({ armyId: dragState.armyId, x: CENTER + clamped.x, y: CENTER + clamped.y });
    },
    [dragState, getCanvasPos, CENTER]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dragState) return;

      const { armyId, x: finalX, y: finalY } = dragState;
      const storedX = (finalX - CENTER) / SCALE;
      const storedY = (finalY - CENTER) / SCALE;

      setPositions((prev) => {
        return { ...prev, [armyId]: { x: finalX, y: finalY } };
      });
      setDragState(null);

      dispatch(setArmySubTilePosition({ id: armyId, subTileX: storedX, subTileY: storedY }));

      if (tile.hasTown) {
        const innerR = theme.town.size[(tile.townSize ?? 'town') as TownSize].radius;
        const distFromCenter = Math.sqrt(storedX * storedX + storedY * storedY);
        dispatch(setArmyInsideTown({ id: armyId, insideTown: distFromCenter < innerR }));
      }
    },
    [dragState, dispatch, tile]
  );

  const hasTown = tile.hasTown;

  return (
    <>
      <StyledCanvas
        ref={canvasRef}
        $size={canvasSize}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <Hint>
        {hasTown
          ? 'Drag armies to position them. The dashed ring marks the town interior.'
          : 'Drag armies to position them on the tile.'}
      </Hint>
    </>
  );
};

export default TileArrangeCanvas;
