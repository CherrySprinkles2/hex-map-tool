import React, { useEffect, useState } from 'react';
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
import { ExportReminderModal } from '../ExportReminderModal/ExportReminderModal';
import useLocalStorageSync from '../../hooks/useLocalStorageSync';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { useAppSelector } from '../../app/hooks';
import { store } from '../../app/store';
import { getAllMaps } from '../../utils/mapsStorage';
import { exportMapJson } from '../../utils/exportMapJson';
import { isExportOverdue, snoozeReminder, clearSnooze } from '../../utils/exportReminder';

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
  const mapId = useAppSelector((state) => {
    return state.currentMap.id;
  });
  const mapName = useAppSelector((state) => {
    return state.currentMap.name;
  });

  // Export reminder — evaluated once per map open (the effect is keyed on mapId,
  // so it runs once per opened map). When a saved map with content is overdue for
  // a backup, show the reminder modal.
  const [reminderOpen, setReminderOpen] = useState(false);

  useEffect(() => {
    if (!mapId) {
      setReminderOpen(false);
      return;
    }

    // The map's tiles load asynchronously after the route resolves; poll briefly
    // until they're in the store before deciding (so we don't nag empty maps and
    // don't miss the content that's about to arrive).
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();

    const evaluate = (): void => {
      if (cancelled) return;
      const entry = getAllMaps().find((m) => {
        return m.id === mapId;
      });
      if (!entry) return;
      if (Object.keys(store.getState().tiles).length > 0) {
        if (isExportOverdue(entry)) setReminderOpen(true);
        return;
      }
      // Tiles not loaded yet — retry until they arrive (give up after ~1.5s).
      if (Date.now() - startedAt < 1500) timer = setTimeout(evaluate, 50);
    };

    timer = setTimeout(evaluate, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mapId]);

  const handleReminderExport = (): void => {
    exportMapJson();
    if (mapId) clearSnooze(mapId);
    setReminderOpen(false);
  };

  const handleReminderSnooze = (): void => {
    if (mapId) snoozeReminder(mapId);
    setReminderOpen(false);
  };

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
      <ExportReminderModal
        open={reminderOpen}
        mapName={mapName}
        onExport={handleReminderExport}
        onSnooze={handleReminderSnooze}
      />
    </AppShell>
  );
};

export default Editor;
