import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { updateTile, deleteTile, toggleTileFlag, setTownName, setTileNotes, blockConnection, unblockConnection } from '../../features/tiles/tilesSlice';
import { addArmy } from '../../features/armies/armiesSlice';
import { deselectTile, selectArmy } from '../../features/ui/uiSlice';
import { theme } from '../../styles/theme';
import { NEIGHBOR_DIRS, toKey } from '../HexGrid/HexUtils';

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: ${({ $open }) => ($open ? '0' : '-300px')};
  width: 280px;
  height: 100vh;
  background: ${({ theme }) => theme.panelBackground};
  border-left: 2px solid ${({ theme }) => theme.panelBorder};
  padding: 24px 16px;
  transition: right 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 100;
  overflow-y: auto;

  @media (max-width: 600px) {
    top: auto;
    right: 0;
    bottom: ${({ $open }) => ($open ? '0' : '-60vh')};
    width: 100%;
    height: 60vh;
    border-left: none;
    border-top: 2px solid ${({ theme }) => theme.panelBorder};
    border-radius: 16px 16px 0 0;
    padding: 16px 16px 32px;
    transition: bottom 0.25s ease;
  }
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const DragHandle = styled.div`
  display: none;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.panelBorder};
  margin: 0 auto -8px;

  @media (max-width: 600px) {
    display: block;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textMuted};
  font-size: 1.2rem;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.text}; }
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.textMuted};
  margin-bottom: 4px;
`;

const TerrainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const TerrainBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 8px;
  border: 2px solid ${({ $active, $color }) => $active ? $color : 'transparent'};
  background: ${({ $color }) => $color}33;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ $color }) => $color}99;
  }

  span.icon { font-size: 1.5rem; }
  span.label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
`;

const FlagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FlagToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 2px solid ${({ $active, $color }) => $active ? $color : 'rgba(255,255,255,0.1)'};
  background: ${({ $active, $color }) => $active ? `${$color}22` : 'rgba(255,255,255,0.03)'};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: ${({ $color }) => $color}77;
  }

  .flag-icon { font-size: 1.2rem; }
  .flag-label { font-size: 0.85rem; letter-spacing: 0.03em; }
  .flag-state {
    margin-left: auto;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.6;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.panelBorder};
`;

const ArmyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ArmyRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid rgba(212, 160, 23, 0.35);
  background: rgba(212, 160, 23, 0.06);
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-size: 0.85rem;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: rgba(212, 160, 23, 0.15);
    border-color: rgba(212, 160, 23, 0.6);
  }
`;

const ArmyRowName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AddArmyBtn = styled.button`
  padding: 10px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.03);
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const DeleteBtn = styled.button`
  margin-top: auto;
  padding: 10px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.accent};
  background: transparent;
  color: ${({ theme }) => theme.accent};
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.accent}22; }
`;

const TownNameInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.town.color}66;
  background: rgba(255,255,255,0.05);
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.town.color};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  min-height: 160px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05);
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;
  line-height: 1.5;
  box-sizing: border-box;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;

  &:focus {
    border-color: rgba(255,255,255,0.35);
  }

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }
`;

const ConnectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 8px;
  padding-left: 4px;
`;

const ConnectionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.textMuted};
`;

const ConnectionBtn = styled.button`
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid ${({ $blocked, $color }) => $blocked ? 'rgba(255,255,255,0.15)' : `${$color}66`};
  background: transparent;
  color: ${({ $blocked, theme }) => $blocked ? theme.textMuted : theme.text};
  font-size: 0.7rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: border-color 0.15s, color 0.15s;
  &:hover {
    border-color: ${({ $color }) => $color};
    color: ${({ theme }) => theme.text};
  }
`;

const DIR_LABELS = ['E', 'NE', 'NW', 'W', 'SW', 'SE'];
const FLAG_BLOCKED_KEY = { hasRiver: 'riverBlocked', hasRoad: 'roadBlocked', hasTown: 'portBlocked' };
const DEEP_WATER_TERRAINS = new Set(['ocean', 'lake']);

const FLAGS = [
  { key: 'hasRiver', label: 'River', icon: '🌊', color: theme.river.color },
  { key: 'hasRoad',  label: 'Road',  icon: '🛤️',  color: theme.road.color  },
  { key: 'hasTown',  label: 'Town',  icon: '🏘️',  color: theme.town.color  },
];

const TileEditPanel = () => {
  const dispatch = useDispatch();
  const selectedKey = useSelector((state) => state.ui.selectedTile);
  const tile = useSelector((state) => selectedKey ? state.tiles[selectedKey] : null);
  const allTiles = useSelector((state) => state.tiles);
  const tileArmies = useSelector((state) =>
    selectedKey
      ? Object.values(state.armies).filter((a) => toKey(a.q, a.r) === selectedKey)
      : []
  );

  const handleTerrainChange = (terrainType) => {
    if (!tile) return;
    dispatch(updateTile({ q: tile.q, r: tile.r, terrain: terrainType }));
  };

  const handleFlagToggle = (flag) => {
    if (!tile) return;
    dispatch(toggleTileFlag({ q: tile.q, r: tile.r, flag }));
  };

  const handleConnectionToggle = (flag, neighborKey, isBlocked) => {
    if (!tile) return;
    if (isBlocked) {
      dispatch(unblockConnection({ q: tile.q, r: tile.r, flag, neighborKey }));
    } else {
      dispatch(blockConnection({ q: tile.q, r: tile.r, flag, neighborKey }));
    }
  };

  const handleNameChange = (e) => {
    if (!tile) return;
    dispatch(setTownName({ q: tile.q, r: tile.r, name: e.target.value }));
  };

  const handleNotesChange = (e) => {
    if (!tile) return;
    dispatch(setTileNotes({ q: tile.q, r: tile.r, notes: e.target.value }));
  };

  const handleDelete = () => {
    if (!tile) return;
    dispatch(deleteTile({ q: tile.q, r: tile.r }));
    dispatch(deselectTile());
  };

  const handleClose = () => dispatch(deselectTile());

  return (
    <Panel $open={!!selectedKey} theme={theme}>
      <DragHandle theme={theme} />
      <PanelTitle theme={theme}>Edit Tile</PanelTitle>
      <CloseBtn onClick={handleClose} theme={theme}>✕</CloseBtn>

      <div>
        <SectionLabel theme={theme}>Terrain</SectionLabel>
        <TerrainGrid>
          {Object.entries(theme.terrain).map(([type, { color, label, icon }]) => (
            <TerrainBtn
              key={type}
              $active={tile?.terrain === type}
              $color={color}
              theme={theme}
              onClick={() => handleTerrainChange(type)}
            >
              <span className="icon">{icon}</span>
              <span className="label">{label}</span>
            </TerrainBtn>
          ))}
        </TerrainGrid>
      </div>

      <Divider theme={theme} />

      <div>
        <SectionLabel theme={theme}>Features</SectionLabel>
        <FlagList>
          {FLAGS.map(({ key, label, icon, color }) => {
            const active = !!(tile?.[key]);
            const blockedKey = FLAG_BLOCKED_KEY[key];
            const isPort = key === 'hasTown';
            const flagNeighbors = active && blockedKey
              ? NEIGHBOR_DIRS.map((dir, i) => {
                  const nk = toKey((tile?.q ?? 0) + dir.q, (tile?.r ?? 0) + dir.r);
                  const neighbor = allTiles[nk];
                  if (isPort) {
                    // Port: show adjacent water tiles regardless of their flags
                    if (!DEEP_WATER_TERRAINS.has(neighbor?.terrain)) return null;
                    const isBlocked = (tile?.[blockedKey] || []).includes(nk);
                    return { nk, dirLabel: DIR_LABELS[i], terrain: neighbor.terrain, isBlocked };
                  } else {
                    // River/road: show adjacent tiles that share the same flag
                    if (!neighbor?.[key]) return null;
                    const isBlocked = (tile?.[blockedKey] || []).includes(nk)
                      || (neighbor[blockedKey] || []).includes(selectedKey);
                    return { nk, dirLabel: DIR_LABELS[i], terrain: neighbor.terrain, isBlocked };
                  }
                }).filter(Boolean)
              : [];
            return (
              <div key={key}>
                <FlagToggle
                  $active={active}
                  $color={color}
                  theme={theme}
                  onClick={() => handleFlagToggle(key)}
                >
                  <span className="flag-icon">{icon}</span>
                  <span className="flag-label">{label}</span>
                  <span className="flag-state">{active ? 'on' : 'off'}</span>
                </FlagToggle>
                {flagNeighbors.length > 0 && (
                  <ConnectionList>
                    {flagNeighbors.map(({ nk, dirLabel, terrain, isBlocked }) => (
                      <ConnectionRow key={nk} theme={theme}>
                        <span>{theme.terrain[terrain]?.icon ?? terrain}</span>
                        <span>{dirLabel}</span>
                        {isBlocked && (
                          <span style={{ opacity: 0.45 }}>{isPort ? 'no port' : 'blocked'}</span>
                        )}
                        <ConnectionBtn
                          $blocked={isBlocked}
                          $color={color}
                          theme={theme}
                          onClick={() => handleConnectionToggle(key, nk, isBlocked)}
                        >
                          {isPort
                            ? (isBlocked ? 'Add Port' : 'Remove Port')
                            : (isBlocked ? 'Restore' : 'Disconnect')}
                        </ConnectionBtn>
                      </ConnectionRow>
                    ))}
                  </ConnectionList>
                )}
              </div>
            );
          })}
        </FlagList>
        {tile?.hasTown && (
          <TownNameInput
            theme={theme}
            value={tile.townName ?? ''}
            onChange={handleNameChange}
            placeholder="Town name…"
            maxLength={32}
            style={{ marginTop: '8px' }}
          />
        )}
      </div>

      <Divider theme={theme} />

      <div>
        <SectionLabel theme={theme}>Notes</SectionLabel>
        <NotesTextarea
          theme={theme}
          value={tile?.notes ?? ''}
          onChange={handleNotesChange}
          placeholder="Add notes about this tile…"
        />
      </div>

      {tileArmies.length > 0 && (
        <div>
          <SectionLabel theme={theme}>Armies on this tile</SectionLabel>
          <ArmyList>
            {tileArmies.map((army) => (
              <ArmyRow key={army.id} theme={theme} onClick={() => dispatch(selectArmy(army.id))}>
                <span>⚔️</span>
                <ArmyRowName>{army.name || 'Unnamed Army'}</ArmyRowName>
                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Select →</span>
              </ArmyRow>
            ))}
          </ArmyList>
        </div>
      )}

      <AddArmyBtn onClick={() => tile && dispatch(addArmy({ q: tile.q, r: tile.r }))} theme={theme}>
        ⚔ Add Army to Tile
      </AddArmyBtn>

      <DeleteBtn onClick={handleDelete} theme={theme}>
        🗑 Delete Tile
      </DeleteBtn>
    </Panel>
  );
};

export default TileEditPanel;
