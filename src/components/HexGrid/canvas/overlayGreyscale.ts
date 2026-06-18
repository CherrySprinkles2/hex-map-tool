// Shared greyscale render treatment for overlays that highlight a subset of
// tiles. After the colour scene is painted, this desaturates every tile that is
// not "relevant" to the active overlay by clipping to those hexes and filling
// with a zero-saturation colour under the `saturation` blend mode (which keeps
// the backdrop's hue/luminosity but drops its saturation → greyscale).
//
//   - army:    relevant = tile has ≥1 army (occupied tiles stay in colour)
//   - notes:   relevant = tile has non-empty notes
//   - forage:  relevant = none (whole base is greyscale; the heatmap tint that
//              drawForaging paints on top supplies the only colour)
//   - faction: relevant = none (whole base is greyscale; the faction tint that
//              drawFactionTint paints on top supplies the only colour)
//   - others:  not a greyscale overlay — this is a no-op

import { hexCorners, axialToPixel, HEX_SIZE } from '../../../utils/hexUtils';
import type { TilesState, Overlay } from '../../../types/state';
import type { Army } from '../../../types/domain';

export const isGreyscaleOverlay = (overlay: Overlay): boolean => {
  return overlay === 'army' || overlay === 'notes' || overlay === 'forage' || overlay === 'faction';
};

// Whether a tile keeps its full colour under the given greyscale overlay.
const keepsColour = (
  overlay: Overlay,
  tile: TilesState[string],
  key: string,
  armiesByTile: Record<string, Army[]>
): boolean => {
  if (overlay === 'army') {
    return (armiesByTile[key]?.length ?? 0) > 0;
  }
  if (overlay === 'notes') {
    return !!tile.notes && tile.notes.trim().length > 0;
  }
  // forage / faction: the whole base is greyscale (a tint pass adds colour).
  return false;
};

interface ApplyGreyscaleArgs {
  ctx: CanvasRenderingContext2D;
  overlay: Overlay;
  tiles: TilesState;
  visibleKeys: Set<string>;
  armiesByTile: Record<string, Army[]>;
}

// Must be called with the world-space viewport transform already applied to ctx.
export const applyOverlayGreyscale = ({
  ctx,
  overlay,
  tiles,
  visibleKeys,
  armiesByTile,
}: ApplyGreyscaleArgs): void => {
  if (!isGreyscaleOverlay(overlay)) return;

  ctx.save();
  ctx.beginPath();
  let anyToGrey = false;
  visibleKeys.forEach((key) => {
    const tile = tiles[key];
    if (!tile) return;
    if (keepsColour(overlay, tile, key, armiesByTile)) return;
    const { x: cx, y: cy } = axialToPixel(tile.q, tile.r);
    const corners = hexCorners(cx, cy, HEX_SIZE);
    corners.forEach((c, i) => {
      if (i === 0) ctx.moveTo(c.x, c.y);
      else ctx.lineTo(c.x, c.y);
    });
    ctx.closePath();
    anyToGrey = true;
  });

  if (!anyToGrey) {
    ctx.restore();
    return;
  }

  ctx.clip();
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = 'hsl(0, 0%, 50%)';
  // Large rect in world space; the clip limits the effect to the hexes above.
  ctx.fillRect(-1e6, -1e6, 2e6, 2e6);
  ctx.restore();
};
