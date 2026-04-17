import { axialToPixel, hexPointsString, HEX_SIZE } from './hexUtils';
import { theme } from '../styles/theme';
import type { TilesState } from '../types/state';
import type { TerrainType, CustomTerrainType } from '../types/domain';

const THUMB_W = 440;
const THUMB_H = 320;

/**
 * Renders a simplified hex map to an off-screen canvas and returns a JPEG data
 * URL suitable for use as a thumbnail. Only terrain polygons are drawn (no
 * overlays, armies, or towns) so the capture is fast even for large maps.
 */
export const captureThumbnail = (
  tiles: TilesState,
  customTerrains: CustomTerrainType[] = []
): string | undefined => {
  const tileValues = Object.values(tiles);
  if (tileValues.length === 0) return undefined;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  tileValues.forEach(({ q, r }) => {
    const { x, y } = axialToPixel(q, r);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  const contentW = maxX - minX + HEX_SIZE * 2;
  const contentH = maxY - minY + HEX_SIZE * 2;
  const scale = Math.min((THUMB_W * 0.9) / contentW, (THUMB_H * 0.9) / contentH, 1);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = THUMB_W;
  canvas.height = THUMB_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  // Background
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);

  ctx.save();
  ctx.translate(THUMB_W / 2, THUMB_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  // Draw each hex tile
  tileValues.forEach(({ q, r, terrain }) => {
    const { x, y } = axialToPixel(q, r);
    const pointsStr = hexPointsString(x, y);
    const color =
      theme.terrain[terrain as TerrainType]?.color ??
      customTerrains.find((ct) => {
        return ct.id === terrain;
      })?.color ??
      theme.terrain.grass.color;

    // Parse the SVG points string into canvas path
    const points = pointsStr.split(' ').map((p) => {
      const [px, py] = p.split(',').map(Number);
      return { x: px, y: py };
    });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = theme.tileStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.7);
};
