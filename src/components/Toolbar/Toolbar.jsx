import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { importTiles } from '../../features/tiles/tilesSlice';
import { deselectTile, setScreen } from '../../features/ui/uiSlice';
import { renameCurrentMap, unloadMap } from '../../features/currentMap/currentMapSlice';
import { renameMap } from '../../utils/mapsStorage';
import { theme } from '../../styles/theme';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: ${({ theme }) => theme.panelBackground};
  border-bottom: 2px solid ${({ theme }) => theme.panelBorder};
  z-index: 50;
`;

const BackBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid ${({ theme }) => theme.panelBorder};
  background: transparent;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  &:hover {
    background: ${({ theme }) => theme.panelBorder};
    color: ${({ theme }) => theme.text};
  }
`;

const MapNameInput = styled.input`
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.text};
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  border-radius: 0;
  padding: 2px 4px;
  margin-right: auto;
  outline: none;
  min-width: 0;
  max-width: 260px;
  transition: border-color 0.15s;
  cursor: text;

  &:hover, &:focus {
    border-bottom-color: ${({ theme }) => theme.textMuted};
  }
`;

const Btn = styled.button`
  padding: 6px 14px;
  border-radius: 6px;
  border: 1.5px solid ${({ theme }) => theme.panelBorder};
  background: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  &:hover {
    background: ${({ theme }) => theme.panelBorder};
  }
`;

const Toolbar = () => {
  const dispatch = useDispatch();
  const tiles = useSelector((state) => state.tiles);
  const mapName = useSelector((state) => state.currentMap.name);
  const mapId = useSelector((state) => state.currentMap.id);
  const fileInput = useRef(null);
  const [localName, setLocalName] = useState('');
  const [editing, setEditing] = useState(false);

  const displayName = editing ? localName : mapName;

  const handleNameFocus = () => {
    setLocalName(mapName);
    setEditing(true);
  };

  const handleNameBlur = () => {
    setEditing(false);
    const trimmed = localName.trim() || 'Untitled Map';
    dispatch(renameCurrentMap(trimmed));
    if (mapId) renameMap(mapId, trimmed);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
    if (e.key === 'Escape') { setEditing(false); }
  };

  const handleBack = () => {
    dispatch(deselectTile());
    dispatch(unloadMap());
    dispatch(importTiles({}));
    dispatch(setScreen('home'));
  };

  const handleExport = () => {
    const json = JSON.stringify(tiles, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapName || 'hex-map'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        dispatch(importTiles(data));
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Bar theme={theme}>
      <BackBtn theme={theme} onClick={handleBack}>← Maps</BackBtn>
      <MapNameInput
        theme={theme}
        value={displayName}
        onChange={(e) => setLocalName(e.target.value)}
        onFocus={handleNameFocus}
        onBlur={handleNameBlur}
        onKeyDown={handleNameKeyDown}
        maxLength={48}
      />
      <Btn theme={theme} onClick={handleExport}>⬇ Export JSON</Btn>
      <Btn theme={theme} onClick={() => fileInput.current?.click()}>⬆ Import JSON</Btn>
      <input
        ref={fileInput}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </Bar>
  );
};

export default Toolbar;
