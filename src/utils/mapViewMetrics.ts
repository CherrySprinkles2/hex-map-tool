// Lets non-canvas UI (e.g. the PNG export modal in the Toolbar) read the live
// size and viewport of the map view without going through React or Redux.
// Mirrors the viewportAnimator registry pattern: HexGrid registers a getter on
// mount and unregisters on unmount.

import type { ViewportState } from '../types/state';

export interface MapViewMetrics {
  width: number;
  height: number;
  viewport: ViewportState;
}

type MetricsFn = () => MapViewMetrics | null;

let metricsFn: MetricsFn | null = null;

export const registerMapView = (fn: MetricsFn): void => {
  metricsFn = fn;
};

export const unregisterMapView = (): void => {
  metricsFn = null;
};

export const getMapViewMetrics = (): MapViewMetrics | null => {
  return metricsFn ? metricsFn() : null;
};
