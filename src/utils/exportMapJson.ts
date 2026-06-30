// Shared JSON-export path used by the Toolbar "Export map" button and the
// export-reminder modal. Builds the export envelope from the live store, triggers
// a download, and stamps the map's last-export timestamp (resetting the reminder).

import { store } from '../app/store';
import { captureThumbnail } from './captureThumbnail';
import { markMapExported } from './mapsStorage';

export const exportMapJson = (): void => {
  const { tiles, armies, factions, terrainConfig, currentMap } = store.getState();
  const name = currentMap.name || 'hex-map';
  const thumbnail = captureThumbnail(tiles, terrainConfig.custom);
  const orientation = currentMap.orientation ?? 'pointy-top';

  const payload = { name, tiles, armies, factions, terrainConfig, thumbnail, orientation };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // JSON export counts as a backup → reset the reminder clock for this map.
  if (currentMap.id) markMapExported(currentMap.id);
};
