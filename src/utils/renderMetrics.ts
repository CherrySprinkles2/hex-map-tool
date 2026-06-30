// Rolling record of canvas repaint timestamps, fed by HexRenderer and read by the
// "Create bug report" button. A flashing / runaway-repaint bug shows up directly
// here as a high repaint count in the last 1s.

const WINDOW_MS = 60_000;
const MAX_ENTRIES = 8_000;

const mainPaints: number[] = [];
const overlayPaints: number[] = [];

const prune = (arr: number[], now: number): void => {
  const cutoff = now - WINDOW_MS;
  let drop = 0;
  while (drop < arr.length && arr[drop] < cutoff) drop += 1;
  if (drop > 0) arr.splice(0, drop);
  if (arr.length > MAX_ENTRIES) arr.splice(0, arr.length - MAX_ENTRIES);
};

const record = (arr: number[]): void => {
  const now = Date.now();
  arr.push(now);
  prune(arr, now);
};

export const recordMainPaint = (): void => {
  return record(mainPaints);
};

export const recordOverlayPaint = (): void => {
  return record(overlayPaints);
};

const countSince = (arr: number[], now: number, ms: number): number => {
  const cutoff = now - ms;
  let n = 0;
  for (let i = arr.length - 1; i >= 0 && arr[i] >= cutoff; i -= 1) n += 1;
  return n;
};

export interface RenderMetrics {
  mainPaints: { last1s: number; last10s: number; last60s: number };
  overlayPaints: { last1s: number; last10s: number; last60s: number };
}

export const getRenderMetrics = (now: number = Date.now()): RenderMetrics => {
  prune(mainPaints, now);
  prune(overlayPaints, now);
  return {
    mainPaints: {
      last1s: countSince(mainPaints, now, 1_000),
      last10s: countSince(mainPaints, now, 10_000),
      last60s: countSince(mainPaints, now, 60_000),
    },
    overlayPaints: {
      last1s: countSince(overlayPaints, now, 1_000),
      last10s: countSince(overlayPaints, now, 10_000),
      last60s: countSince(overlayPaints, now, 60_000),
    },
  };
};

/** Reset both buffers (used by tests). */
export const clearRenderMetrics = (): void => {
  mainPaints.length = 0;
  overlayPaints.length = 0;
};
