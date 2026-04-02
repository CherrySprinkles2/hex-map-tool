import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { updateTile, deleteTile } from '../../features/tiles/tilesSlice';
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

const TileEditPanel = () => {
  const dispatch = useDispatch();
  const selectedKey = useSelector((state) => state.ui.selectedTile);
  const tile = useSelector((state) => selectedKey ? state.tiles[selectedKey] : null);

  const handleTerrainChange = (terrainType) => {
    if (!tile) return;
    dispatch(updateTile({ q: tile.q, r: tile.r, terrain: terrainType }));
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

      <DeleteBtn onClick={handleDelete} theme={theme}>
        🗑 Delete Tile
      </DeleteBtn>
    </Panel>
  );
};

export default TileEditPanel;
