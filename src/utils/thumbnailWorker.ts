import { axialToPixel, hexPointsString, HEX_SIZE, setHexOrientation } from './hexUtils';
import { theme } from '../styles/theme';
import type { TilesState } from '../types/state';
import type { TerrainType, CustomTerrainType, HexOrientation } from '../types/domain';

const THUMB_W = 440;
const THUMB_H = 320;

export interface ThumbnailWorkerRequest {
  id: number;
  tiles: TilesState;
  customTerrains: CustomTerrainType[];
  orientation: HexOrientation;
}

export interface ThumbnailWorkerResponse {
  id: number;
  arrayBuffer: ArrayBuffer | null;
}

// Typed narrowly so we don't pull in webworker lib alongside dom lib.
interface WorkerSelf {
  postMessage(data: unknown): void;
  addEventListener(
    type: 'message',
    listener: (e: MessageEvent<ThumbnailWorkerRequest>) => void
  ): void;
}

const workerSelf = self as unknown as WorkerSelf;

workerSelf.addEventListener('message', (e) => {
  void render(e.data);
});

async function render({
  id,
  tiles,
  customTerrains,
  orientation,
}: ThumbnailWorkerRequest): Promise<void> {
  setHexOrientation(orientation);

  const tileValues = Object.values(tiles);
  if (tileValues.length === 0) {
    workerSelf.postMessage({ id, arrayBuffer: null } satisfies ThumbnailWorkerResponse);
    return;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

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

  const canvas = new OffscreenCanvas(THUMB_W, THUMB_H);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    workerSelf.postMessage({ id, arrayBuffer: null } satisfies ThumbnailWorkerResponse);
    return;
  }

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);

  ctx.save();
  ctx.translate(THUMB_W / 2, THUMB_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  tileValues.forEach(({ q, r, terrain }) => {
    const { x, y } = axialToPixel(q, r);
    const pointsStr = hexPointsString(x, y);
    const color =
      theme.terrain[terrain as TerrainType]?.color ??
      customTerrains.find((ct) => {
        return ct.id === terrain;
      })?.color ??
      theme.terrain.grass.color;

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

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
  const arrayBuffer = await blob.arrayBuffer();
  workerSelf.postMessage({ id, arrayBuffer } satisfies ThumbnailWorkerResponse);
}
