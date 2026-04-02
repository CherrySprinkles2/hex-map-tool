import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { importTiles } from '../../features/tiles/tilesSlice';
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

const AppTitle = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.text};
  margin-right: auto;
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
  const fileInput = useRef(null);

  const handleExport = () => {
    const json = JSON.stringify(tiles, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hex-map.json';
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
      <AppTitle theme={theme}>⬡ Hex Map Tool</AppTitle>
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
