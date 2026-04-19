// Canvas-mode hit testing. Replaces the invisible SVG polygon layer used in the
// hybrid phases: given client coordinates and the current viewport / state,
// returns the entity under the cursor.
//
// Entity priority (matches the paint order on canvas):
//   1. Army tokens (skipping armies inside town tiles — the town shield stands in)
//   2. Placed tiles via axial projection
//   3. Ghost tiles (neighbours of placed tiles, from a pre-computed set)
//   4. Background (outside everything)

import { axialToPixel, pixelToAxial, toKey } from '../../../utils/hexUtils';
import { theme } from '../../../styles/theme';
import type { store } from '../../../app/store';
import type { Army } from '../../../types/domain';
import type { ViewportState } from '../../../types/state';

type AppState = ReturnType<typeof store.getState>;

export type HitResult =
  | { kind: 'army'; army: Army }
  | { kind: 'tile'; key: string; q: number; r: number }
  | { kind: 'ghost'; key: string; q: number; r: number }
  | { kind: 'bg' };

export const clientToWorld = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  vp: ViewportState
): { worldX: number; worldY: number } => {
  const worldX = (clientX - rect.left - (rect.width / 2 + vp.x)) / vp.scale;
  const worldY = (clientY - rect.top - (rect.height / 2 + vp.y)) / vp.scale;
  return { worldX, worldY };
};

interface HitTestOpts {
  state: AppState;
  ghostKeys: Set<string>;
  worldX: number;
  worldY: number;
}

export const hitTest = ({ state, ghostKeys, worldX, worldY }: HitTestOpts): HitResult => {
  // 1. Armies: circle hit-test at each army's drawn centre.
  const tokenR2 = theme.army.tokenRadius * theme.army.tokenRadius;
  const grouped: Record<string, Army[]> = {};
  Object.values(state.armies).forEach((army) => {
    const k = toKey(army.q, army.r);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(army);
  });
  for (const tileKey of Object.keys(grouped)) {
    const tile = state.tiles[tileKey];
    if (tile?.hasTown) continue; // town shield takes over — no army token to hit
    const [qS, rS] = tileKey.split(',');
    const { x: baseX, y: baseY } = axialToPixel(Number(qS), Number(rS));
    const tileArmies = grouped[tileKey];
    for (let idx = 0; idx < tileArmies.length; idx++) {
      const offsetX = (idx - (tileArmies.length - 1) / 2) * theme.army.stackSpacing;
      const ax = baseX + offsetX;
      const ay = baseY - 8;
      const dx = worldX - ax;
      const dy = worldY - ay;
      if (dx * dx + dy * dy <= tokenR2) {
        return { kind: 'army', army: tileArmies[idx] };
      }
    }
  }

  // 2. Placed tile or 3. ghost tile via axial projection.
  const { q, r } = pixelToAxial(worldX, worldY);
  const key = toKey(q, r);
  if (state.tiles[key]) return { kind: 'tile', key, q, r };
  if (ghostKeys.has(key)) return { kind: 'ghost', key, q, r };
  return { kind: 'bg' };
};
