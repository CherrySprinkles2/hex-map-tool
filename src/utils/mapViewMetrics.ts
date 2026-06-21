// Lets non-canvas UI (e.g. the PNG export view) read the live size and viewport
// of the map view without going through React or Redux. Mirrors the
// viewportAnimator registry pattern: HexGrid registers a getter on mount and
// unregisters on unmount.

import type { ViewportState } from '../types/state';

export interface MapViewMetrics {
  width: number;
  height: number;
  viewport: ViewportState;
}

type MetricsFn = () => MapViewMetrics | null;

let metricsFn: MetricsFn | null = null;
// Frozen copy taken when entering the PNG export view. The view unmounts
// HexGrid, so the live getter is gone by the time the export renders — the
// snapshot preserves what the user saw at the moment they opened the view.
let snapshot: MapViewMetrics | null = null;

export const registerMapView = (fn: MetricsFn): void => {
  metricsFn = fn;
};

export const unregisterMapView = (): void => {
  metricsFn = null;
};

export const getMapViewMetrics = (): MapViewMetrics | null => {
  return metricsFn ? metricsFn() : null;
};

/** Capture the current live metrics for later use once HexGrid has unmounted. */
export const captureMapViewMetrics = (): void => {
  snapshot = metricsFn ? metricsFn() : null;
};

/** The metrics captured at export-view entry, falling back to the live getter. */
export const getCapturedMapViewMetrics = (): MapViewMetrics | null => {
  return snapshot ?? getMapViewMetrics();
};
