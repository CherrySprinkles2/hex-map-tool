import type { TilesState, ArmiesState } from './state';
import type { Faction } from './domain';

export type { TilesState, ArmiesState };

export interface HistorySnapshot {
  tiles: TilesState;
  armies: ArmiesState;
  factions: Faction[];
}
