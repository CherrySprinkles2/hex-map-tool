// Imperative renderer for the hex map. Hosted inside HexGrid.tsx, which owns the
// two <canvas> elements and passes them in via attach(). The renderer subscribes
// to the Redux store directly and schedules repaints via requestAnimationFrame
// so that pan/zoom and data changes never cause React to re-render.
//
// Main canvas: base tiles, ghosts, overlays (rivers, roads, causeways, ports),
//   towns (+ walls + kite shield), town/army labels, army tokens.
// Overlay canvas: marching-ants selection/move rings, driven by a continuous
//   rAF loop that runs only while there's something selected/moving.
//
// Phase 6 removes the SVG stack entirely and moves hit-testing into this class.

import { theme } from '../../../styles/theme';
import { createPatternCache, type PatternCache } from './patternCache';
import { drawTiles } from './drawTiles';
import { drawGhosts } from './drawGhosts';
import { drawRivers } from './drawRivers';
import { drawRoads } from './drawRoads';
import { drawCauseways } from './drawCauseways';
import { drawPorts } from './drawPorts';
import { drawTowns } from './drawTowns';
import { drawLabels } from './drawLabels';
import { drawArmies } from './drawArmies';
import { drawOverlay } from './drawOverlay';
import { buildDeepWaterSet, getNeighbors, toKey } from '../../../utils/hexUtils';
import { registerRepaintOnLoad } from '../../../utils/svgCache';
import type { store as appStore } from '../../../app/store';
import type { ViewportState } from '../../../types/state';
import type { Army } from '../../../types/domain';

type AppStore = typeof appStore;

interface HexRendererOptions {
  store: AppStore;
  viewportRef: React.RefObject<ViewportState | null>;
}

export class HexRenderer {
  private mainCanvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private mainCtx: CanvasRenderingContext2D | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;
  private patternCache: PatternCache | null = null;

  private store: AppStore;
  private viewportRef: React.RefObject<ViewportState | null>;

  private visibleKeys: Set<string> = new Set();
  private ghostKeys: Set<string> = new Set();
  private hoveredKey: string | null = null;
  private cssWidth = 0;
  private cssHeight = 0;
  private dpr = 1;

  private rafMain: number | null = null;
  private rafOverlay: number | null = null;
  private unsubStore: (() => void) | null = null;
  private unsubSvgCache: (() => void) | null = null;
  private resizeObs: ResizeObserver | null = null;

  private lastTilesRef: unknown = null;
  private lastArmiesRef: unknown = null;
  private lastCustomRef: unknown = null;
  private lastFactionsRef: unknown = null;
  private lastUiMode: string | null = null;
  private lastSelectedTile: string | null = null;
  private lastSelectedArmyId: string | null = null;
  private lastMovingArmyId: string | null = null;

  constructor(opts: HexRendererOptions) {
    this.store = opts.store;
    this.viewportRef = opts.viewportRef;
  }

  attach(main: HTMLCanvasElement, overlay: HTMLCanvasElement): void {
    this.mainCanvas = main;
    this.overlayCanvas = overlay;
    const mctx = main.getContext('2d');
    const octx = overlay.getContext('2d');
    if (!mctx || !octx) return;
    this.mainCtx = mctx;
    this.overlayCtx = octx;
    this.patternCache = createPatternCache(mctx);

    const state = this.store.getState();
    this.patternCache.syncCustom(state.terrainConfig.custom);
    this.lastCustomRef = state.terrainConfig.custom;
    this.lastTilesRef = state.tiles;
    this.lastArmiesRef = state.armies;
    this.lastFactionsRef = state.factions;
    this.lastUiMode = state.ui.mapMode;
    this.lastSelectedTile = state.ui.selectedTile;
    this.lastSelectedArmyId = state.ui.selectedArmyId;
    this.lastMovingArmyId = state.ui.movingArmyId;

    this.measure();

    this.resizeObs = new ResizeObserver(() => {
      this.measure();
      this.scheduleRepaint();
      this.scheduleOverlay();
    });
    this.resizeObs.observe(main);

    this.unsubStore = this.store.subscribe(() => {
      const s = this.store.getState();
      let needsMain = false;
      let needsOverlay = false;
      if (s.tiles !== this.lastTilesRef) {
        this.lastTilesRef = s.tiles;
        needsMain = true;
        needsOverlay = true;
      }
      if (s.armies !== this.lastArmiesRef) {
        this.lastArmiesRef = s.armies;
        needsMain = true;
        needsOverlay = true;
      }
      if (s.terrainConfig.custom !== this.lastCustomRef) {
        this.lastCustomRef = s.terrainConfig.custom;
        this.patternCache?.syncCustom(s.terrainConfig.custom);
        needsMain = true;
      }
      if (s.factions !== this.lastFactionsRef) {
        this.lastFactionsRef = s.factions;
        needsMain = true;
      }
      if (s.ui.mapMode !== this.lastUiMode) {
        this.lastUiMode = s.ui.mapMode;
        needsMain = true;
      }
      if (s.ui.selectedTile !== this.lastSelectedTile) {
        this.lastSelectedTile = s.ui.selectedTile;
        needsOverlay = true;
      }
      if (s.ui.selectedArmyId !== this.lastSelectedArmyId) {
        this.lastSelectedArmyId = s.ui.selectedArmyId;
        needsOverlay = true;
        needsMain = true; // army token stroke colour depends on selection
      }
      if (s.ui.movingArmyId !== this.lastMovingArmyId) {
        this.lastMovingArmyId = s.ui.movingArmyId;
        needsOverlay = true;
        needsMain = true;
      }
      if (needsMain) this.scheduleRepaint();
      if (needsOverlay) this.scheduleOverlay();
    });

    // Repaint once SVG assets finish loading — builtin patterns & town/army
    // icons become available asynchronously. The refresh() call evicts stale
    // null entries for builtins so the next get() re-reads from svgCache.
    this.unsubSvgCache = registerRepaintOnLoad(() => {
      this.patternCache?.refresh();
      const s = this.store.getState();
      this.patternCache?.syncCustom(s.terrainConfig.custom);
      this.scheduleRepaint();
    });

    this.scheduleRepaint();
    this.scheduleOverlay();
  }

  detach(): void {
    if (this.rafMain !== null) {
      cancelAnimationFrame(this.rafMain);
      this.rafMain = null;
    }
    if (this.rafOverlay !== null) {
      cancelAnimationFrame(this.rafOverlay);
      this.rafOverlay = null;
    }
    this.unsubStore?.();
    this.unsubStore = null;
    this.unsubSvgCache?.();
    this.unsubSvgCache = null;
    this.resizeObs?.disconnect();
    this.resizeObs = null;
    this.mainCanvas = null;
    this.overlayCanvas = null;
    this.mainCtx = null;
    this.overlayCtx = null;
    this.patternCache = null;
  }

  setVisibleKeys(keys: Set<string>): void {
    if (keys === this.visibleKeys) return;
    this.visibleKeys = keys;
    this.scheduleRepaint();
  }

  setGhostKeys(keys: Set<string>): void {
    if (keys === this.ghostKeys) return;
    this.ghostKeys = keys;
    this.scheduleRepaint();
  }

  setHoveredKey(key: string | null): void {
    if (this.hoveredKey === key) return;
    this.hoveredKey = key;
    this.scheduleRepaint();
  }

  // Called by HexGrid on every pan/zoom frame from the same rAF loop that
  // updates the SVG <g> transform, so canvas and SVG layers stay in sync.
  onViewportChanged(): void {
    this.scheduleRepaint();
    this.scheduleOverlay();
  }

  private measure(): void {
    if (!this.mainCanvas || !this.overlayCanvas) return;
    const rect = this.mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
    this.dpr = dpr;
    const pxW = Math.max(1, Math.round(rect.width * dpr));
    const pxH = Math.max(1, Math.round(rect.height * dpr));
    for (const c of [this.mainCanvas, this.overlayCanvas]) {
      if (c.width !== pxW) c.width = pxW;
      if (c.height !== pxH) c.height = pxH;
    }
  }

  scheduleRepaint(): void {
    if (this.rafMain !== null) return;
    this.rafMain = requestAnimationFrame(() => {
      this.rafMain = null;
      this.paintMain();
    });
  }

  // The overlay canvas is repainted continuously as long as there's an active
  // selection/movement (marching-ants animation). When nothing is active, we
  // paint once more to clear the canvas, then stop the loop.
  private scheduleOverlay(): void {
    if (this.rafOverlay !== null) return;
    this.rafOverlay = requestAnimationFrame((t) => {
      this.rafOverlay = null;
      this.paintOverlay(t);
      // If anything is still active, keep the loop going.
      const s = this.store.getState();
      if (s.ui.selectedTile || s.ui.selectedArmyId || s.ui.movingArmyId) {
        this.scheduleOverlay();
      }
    });
  }

  // Expand visibleKeys by one hex-ring of neighbors that also exist in `tiles`
  // so overlays at viewport edges render correctly (matches WaterOverlay).
  private expandKeys(): Set<string> {
    const state = this.store.getState();
    const tiles = state.tiles;
    const expanded = new Set<string>(this.visibleKeys);
    this.visibleKeys.forEach((key) => {
      const tile = tiles[key];
      if (!tile) return;
      getNeighbors(tile.q, tile.r).forEach((n) => {
        const nk = toKey(n.q, n.r);
        if (tiles[nk]) expanded.add(nk);
      });
    });
    return expanded;
  }

  private applyViewportTransform(ctx: CanvasRenderingContext2D): void {
    const vp = this.viewportRef.current;
    if (!vp) return;
    const { dpr, cssWidth, cssHeight } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cssWidth * dpr, cssHeight * dpr);
    const tx = dpr * (cssWidth / 2 + vp.x);
    const ty = dpr * (cssHeight / 2 + vp.y);
    const s = dpr * vp.scale;
    ctx.setTransform(s, 0, 0, s, tx, ty);
  }

  private groupArmiesByTile(state: ReturnType<AppStore['getState']>): Record<string, Army[]> {
    const grouped: Record<string, Army[]> = {};
    Object.values(state.armies).forEach((army) => {
      const key = toKey(army.q, army.r);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(army);
    });
    return grouped;
  }

  private paintMain(): void {
    if (!this.mainCtx || !this.mainCanvas) return;
    const vp = this.viewportRef.current;
    if (!vp) return;

    const ctx = this.mainCtx;
    this.applyViewportTransform(ctx);

    const state = this.store.getState();
    const deepWaterSet = buildDeepWaterSet(state.terrainConfig.custom);
    const factionColorMap: Record<string, string> = {};
    state.factions.forEach((f) => {
      factionColorMap[f.id] = f.color;
    });
    const armiesByTile = this.groupArmiesByTile(state);
    const expanded = this.expandKeys();

    // 1. Ghost outlines (below tiles)
    drawGhosts({ ctx, ghostKeys: this.ghostKeys, theme, hoveredKey: this.hoveredKey });

    // 2. Base tiles
    drawTiles({
      ctx,
      tiles: state.tiles,
      visibleKeys: this.visibleKeys,
      customTerrains: state.terrainConfig.custom,
      factions: state.factions,
      theme,
      patternCache: this.patternCache!,
      mapMode: state.ui.mapMode,
      hoveredKey: this.hoveredKey,
    });

    // 3. Overlays (rivers under roads; causeways and ports)
    const riverCurvesByTile = drawRivers({
      ctx,
      tiles: state.tiles,
      iterateKeys: expanded,
      deepWaterSet,
      theme,
    });
    drawRoads({
      ctx,
      tiles: state.tiles,
      iterateKeys: expanded,
      deepWaterSet,
      riverCurvesByTile,
      theme,
    });
    drawCauseways({
      ctx,
      tiles: state.tiles,
      iterateKeys: expanded,
      deepWaterSet,
      theme,
    });
    drawTowns({
      ctx,
      tiles: state.tiles,
      iterateKeys: expanded,
      deepWaterSet,
      armiesByTile,
      factionColorMap,
      theme,
    });
    drawPorts({
      ctx,
      tiles: state.tiles,
      iterateKeys: expanded,
      deepWaterSet,
      theme,
    });
    drawLabels({
      ctx,
      tiles: state.tiles,
      iterateKeys: expanded,
      deepWaterSet,
      armiesByTile,
      theme,
    });

    // 4. Army tokens (static parts; animated ring lives on overlay canvas)
    drawArmies({
      ctx,
      tiles: state.tiles,
      iterateKeys: this.visibleKeys,
      armiesByTile,
      factionColorMap,
      theme,
      selectedArmyId: state.ui.selectedArmyId,
      movingArmyId: state.ui.movingArmyId,
    });
  }

  private paintOverlay(nowMs: number): void {
    if (!this.overlayCtx || !this.overlayCanvas) return;
    const vp = this.viewportRef.current;
    if (!vp) return;

    const ctx = this.overlayCtx;
    this.applyViewportTransform(ctx);

    const state = this.store.getState();
    const armiesByTile = this.groupArmiesByTile(state);

    drawOverlay({
      ctx,
      tiles: state.tiles,
      armiesByTile,
      selectedTile: state.ui.selectedTile,
      selectedArmyId: state.ui.selectedArmyId,
      movingArmyId: state.ui.movingArmyId,
      nowMs,
      theme,
    });
  }
}
