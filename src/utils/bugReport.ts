// Builds and downloads a diagnostic bug report: the last ~60s of Redux actions
// (payloads anonymised, never map data), recent canvas repaint stats, and
// device/environment info. Intended to capture runaway-rerender / "flashing"
// issues that are otherwise hard to reproduce.
//
// Everything that could reveal map content is anonymised: the map name and the
// URL slug become per-session tokens, and tile/army/faction counts are coarsened
// into ranges (see utils/anonymize). Action payloads are anonymised at record
// time in actionLog. Render/timing/environment data is map-independent and kept
// as-is.

import { store } from '../app/store';
import { getActionLog, ACTION_LOG_WINDOW_MS } from '../app/actionLog';
import { getRenderMetrics } from './renderMetrics';
import { anonToken, bucket } from './anonymize';

// Replace the map slug in a /map/<slug> path with a token so the (slugified) map
// name can't be read off the URL. Other routes pass through unchanged.
const sanitizePath = (pathname: string): string => {
  const match = pathname.match(/^\/map\/(.+)$/);
  return match ? `/map/${anonToken(match[1])}` : pathname;
};

export interface BugReport {
  schema: 'hex-map-tool-bug-report/2';
  generatedAt: string;
  app: {
    url: string;
    route: string;
    mapId: string | null;
    /** Anonymised token of the map name, not the name itself. */
    mapName: string;
    /** Coarse range buckets, not exact counts. */
    tileCount: string;
    armyCount: string;
    factionCount: string;
  };
  environment: {
    userAgent: string;
    language: string;
    online: boolean;
    devicePixelRatio: number;
    documentHidden: boolean;
    visibilityState: string;
    screen: { width: number; height: number };
    window: { innerWidth: number; innerHeight: number };
  };
  render: ReturnType<typeof getRenderMetrics>;
  actions: {
    windowMs: number;
    count: number;
    perSecond: number;
    log: ReturnType<typeof getActionLog>;
  };
}

export const buildBugReport = (now: number = Date.now()): BugReport => {
  const state = store.getState();
  const log = getActionLog(now);
  const perSecond = log.length / (ACTION_LOG_WINDOW_MS / 1000);

  return {
    schema: 'hex-map-tool-bug-report/2',
    generatedAt: new Date(now).toISOString(),
    app: {
      url: window.location.origin + sanitizePath(window.location.pathname),
      route: sanitizePath(window.location.pathname),
      mapId: state.currentMap.id,
      mapName: anonToken(state.currentMap.name),
      tileCount: bucket(Object.keys(state.tiles).length),
      armyCount: bucket(Object.keys(state.armies).length),
      factionCount: bucket(state.factions.length),
    },
    environment: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      devicePixelRatio: window.devicePixelRatio,
      documentHidden: document.hidden,
      visibilityState: document.visibilityState,
      screen: { width: window.screen.width, height: window.screen.height },
      window: { innerWidth: window.innerWidth, innerHeight: window.innerHeight },
    },
    render: getRenderMetrics(now),
    actions: {
      windowMs: ACTION_LOG_WINDOW_MS,
      count: log.length,
      perSecond: Math.round(perSecond * 10) / 10,
      log,
    },
  };
};

export const downloadBugReport = (): void => {
  const report = buildBugReport();
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const stamp = report.generatedAt.replace(/[:.]/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `hex-map-tool-bug-report-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
