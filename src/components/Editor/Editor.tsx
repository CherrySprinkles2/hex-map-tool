import React from 'react';
import styled from 'styled-components';
import HexGrid from '../HexGrid/HexGrid';
import TileEditPanel from '../TileEditPanel/TileEditPanel';
import TownEditPanel from '../TownEditPanel/TownEditPanel';
import ArmyPanel from '../ArmyPanel/ArmyPanel';
import ArmyEditPanel from '../ArmyEditPanel/ArmyEditPanel';
import Toolbar from '../Toolbar/Toolbar';
import FactionsPanel from '../FactionsPanel/FactionsPanel';
import FactionPaintPanel from '../FactionPaintPanel/FactionPaintPanel';
import ForagePanel from '../ForagePanel/ForagePanel';
import NotesPanel from '../NotesPanel/NotesPanel';
import MapModeToggle from '../MapModeToggle/MapModeToggle';
import KeyboardShortcutsPanel from '../KeyboardShortcutsPanel/KeyboardShortcutsPanel';
import ExportPngView from '../ExportPngView/ExportPngView';
import useLocalStorageSync from '../../hooks/useLocalStorageSync';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { useAppSelector } from '../../app/hooks';

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const CanvasArea = styled.div`
  flex: 1;
  position: relative;
  display: flex;
`;

const Editor = (): React.ReactElement => {
  useLocalStorageSync();
  const exporting = useAppSelector((state) => {
    return state.ui.exporting;
  });
  // Editor shortcuts don't apply to the export image.
  useKeyboardShortcuts(!exporting);
  const selectedArmyId = useAppSelector((state) => {
    return state.ui.selectedArmyId;
  });

  if (exporting) {
    return <ExportPngView />;
  }

  return (
    <AppShell>
      <Toolbar />
      <CanvasArea>
        <ArmyEditPanel />
        <ArmyPanel />
        <HexGrid />
        <MapModeToggle />
        <TileEditPanel />
        <TownEditPanel />
        <FactionPaintPanel suppressed={selectedArmyId !== null} />
        <ForagePanel />
        <NotesPanel />
        <FactionsPanel />
        <KeyboardShortcutsPanel />
      </CanvasArea>
    </AppShell>
  );
};

export default Editor;
