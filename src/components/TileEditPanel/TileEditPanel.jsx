import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { updateTile, deleteTile, toggleTileFlag } from '../../features/tiles/tilesSlice';
import { deselectTile } from '../../features/ui/uiSlice';
import { theme } from '../../styles/theme';

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
`;

const PanelTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
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

const FLAGS = [
  { key: 'hasRiver', label: 'River', icon: '🌊', color: theme.river.color },
  { key: 'hasRoad',  label: 'Road',  icon: '🛤️',  color: theme.road.color  },
];

const TileEditPanel = () => {
  const dispatch = useDispatch();
  const selectedKey = useSelector((state) => state.ui.selectedTile);
  const tile = useSelector((state) => selectedKey ? state.tiles[selectedKey] : null);

  const handleTerrainChange = (terrainType) => {
    if (!tile) return;
    dispatch(updateTile({ q: tile.q, r: tile.r, terrain: terrainType }));
  };

  const handleFlagToggle = (flag) => {
    if (!tile) return;
    dispatch(toggleTileFlag({ q: tile.q, r: tile.r, flag }));
  };

  const handleDelete = () => {
    if (!tile) return;
    dispatch(deleteTile({ q: tile.q, r: tile.r }));
    dispatch(deselectTile());
  };

  const handleClose = () => dispatch(deselectTile());

  return (
    <Panel $open={!!selectedKey} theme={theme}>
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
            return (
              <FlagToggle
                key={key}
                $active={active}
                $color={color}
                theme={theme}
                onClick={() => handleFlagToggle(key)}
              >
                <span className="flag-icon">{icon}</span>
                <span className="flag-label">{label}</span>
                <span className="flag-state">{active ? 'on' : 'off'}</span>
              </FlagToggle>
            );
          })}
        </FlagList>
      </div>

      <DeleteBtn onClick={handleDelete} theme={theme}>
        🗑 Delete Tile
      </DeleteBtn>
    </Panel>
  );
};

export default TileEditPanel;
