import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { importTiles } from '../../features/tiles/tilesSlice';
import { importArmies } from '../../features/armies/armiesSlice';
import { deselectTile, deselectArmy, setScreen, toggleFactionsPanel } from '../../features/ui/uiSlice';
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
  flex-shrink: 0;
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
  outline: none;
  min-width: 0;
  flex: 1;
  max-width: 260px;
  transition: border-color 0.15s;
  cursor: text;

  @media (min-width: 601px) {
    max-width: 100%;
    margin-right: auto;
  }

  &:hover, &:focus {
    border-bottom-color: ${({ theme }) => theme.textMuted};
  }
`;

const SettingsBtn = styled.button`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1.5px solid ${({ theme }) => theme.panelBorder};
  background: ${({ $active }) => ($active ? theme.panelBorder : 'transparent')};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1;
  flex-shrink: 0;
  &:hover { background: ${() => theme.panelBorder}; }
`;

const DesktopFactionsBtn = styled.button`
  display: none;

  @media (min-width: 601px) {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1.5px solid ${({ theme }) => theme.panelBorder};
    background: ${({ $active, theme }) => ($active ? theme.panelBorder : 'transparent')};
    color: ${({ theme }) => theme.text};
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
    &:hover { background: ${({ theme }) => theme.panelBorder}; }
  }
`;

// ── Bottom sheet ──────────────────────────────────────────────────────────────

const Backdrop = styled.div`
  display: ${({ $open }) => ($open ? 'block' : 'none')};
  position: fixed;
  inset: 0;
  z-index: 149;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: ${({ $open }) => ($open ? '0' : '-100%')};
  z-index: 150;
  background: ${({ theme }) => theme.panelBackground};
  border-top: 2px solid ${({ theme }) => theme.panelBorder};
  border-radius: 16px 16px 0 0;
  padding: 8px 0 env(safe-area-inset-bottom, 0);
  transition: bottom 0.25s ease;
  max-width: 480px;
  margin: 0 auto;

  /* On wider screens, auto-size and float to top-right of toolbar */
  @media (min-width: 601px) {
    left: auto;
    right: 16px;
    bottom: auto;
    top: ${({ $open }) => ($open ? '52px' : '-200%')};
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.panelBorder};
    min-width: 220px;
    padding: 4px 0;
    transition: top 0.2s ease, opacity 0.2s ease;
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  }
`;

const SheetHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => theme.panelBorder};
  margin: 8px auto 12px;

  @media (min-width: 601px) {
    display: none;
  }
`;

const SheetItem = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 24px;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.06)' : 'transparent')};
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  letter-spacing: 0.02em;

  &:hover { background: rgba(255,255,255,0.08); }

  @media (min-width: 601px) {
    padding: 10px 20px;
    font-size: 0.85rem;
    display: ${({ $desktopHide }) => ($desktopHide ? 'none' : 'flex')};
  }
`;

const SheetIcon = styled.span`
  font-size: 1.1rem;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
`;

const Toolbar = () => {
  const dispatch = useDispatch();
  const tiles = useSelector((state) => state.tiles);
  const mapName = useSelector((state) => state.currentMap.name);
  const mapId = useSelector((state) => state.currentMap.id);
  const factionsOpen = useSelector((state) => state.ui.factionsOpen);
  const fileInput = useRef(null);
  const [localName, setLocalName] = useState('');
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    dispatch(deselectArmy());
    dispatch(unloadMap());
    dispatch(importTiles({}));
    dispatch(importArmies({}));
    dispatch(setScreen('home'));
  };

  const handleExport = () => {
    setSettingsOpen(false);
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

  const handleFactionsClick = () => {
    setSettingsOpen(false);
    dispatch(toggleFactionsPanel());
  };

  return (
    <>
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
        <DesktopFactionsBtn
          theme={theme}
          $active={factionsOpen}
          onClick={handleFactionsClick}
        >
          ⚑ Factions
        </DesktopFactionsBtn>
        <SettingsBtn
          theme={theme}
          $active={settingsOpen}
          onClick={() => setSettingsOpen((o) => !o)}
          aria-label="Settings"
        >
          ⚙
        </SettingsBtn>
      </Bar>

      <Backdrop $open={settingsOpen} onClick={() => setSettingsOpen(false)} />

      <Sheet theme={theme} $open={settingsOpen}>
        <SheetHandle theme={theme} />
        <SheetItem theme={theme} $active={factionsOpen} $desktopHide onClick={handleFactionsClick}>
          <SheetIcon>⚑</SheetIcon>Factions
        </SheetItem>
        <SheetItem theme={theme} onClick={handleExport}>
          <SheetIcon>⬇</SheetIcon>Export JSON
        </SheetItem>
        <SheetItem theme={theme} onClick={() => { setSettingsOpen(false); fileInput.current?.click(); }}>
          <SheetIcon>⬆</SheetIcon>Import JSON
        </SheetItem>
      </Sheet>

      <input
        ref={fileInput}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </>
  );
};

export default Toolbar;

