import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppStore } from '../../app/hooks';
import { stopPngExport } from '../../features/ui/uiSlice';
import { exportMapPng, renderMapPngCanvas } from '../../utils/exportPng';
import type { PngExportArea, DrawStroke } from '../../utils/exportPng';
import { ConfirmModal } from '../shared/ConfirmModal';
import { ExportHeader } from './ExportHeader';
import { ExportEditPanel, PALETTE, DEFAULT_WIDTH } from './ExportEditPanel';
import { AnnotationStage } from './AnnotationStage';

const AppShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const Body = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  min-height: 0;
  background: repeating-conic-gradient(
      ${({ theme }) => {
          return theme.surface.subtle;
        }}
        0% 25%,
      transparent 0% 50%
    )
    50% / 24px 24px;

  /* Keep the rendered image clear of the floating panel. */
  @media (min-width: 601px) {
    padding-right: 280px;
  }
  @media (max-width: 600px) {
    padding-bottom: 50vh;
  }
`;

const ExportPngView = (): React.ReactElement => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const mapName = useAppSelector((state) => {
    return state.currentMap.name;
  });
  const overlay = useAppSelector((state) => {
    return state.ui.overlay;
  });
  const hasTiles = useAppSelector((state) => {
    return Object.keys(state.tiles).length > 0;
  });

  const [area, setArea] = useState<PngExportArea>('viewport');
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [redoStack, setRedoStack] = useState<DrawStroke[]>([]);
  const [color, setColor] = useState(PALETTE[0]);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [baseCanvas, setBaseCanvas] = useState<HTMLCanvasElement | null>(null);
  const [pendingArea, setPendingArea] = useState<PngExportArea | null>(null);

  const handleBack = useCallback(() => {
    dispatch(stopPngExport());
  }, [dispatch]);

  // Re-render the base image whenever the export area or overlay changes.
  useEffect(() => {
    const state = store.getState();
    const base = renderMapPngCanvas({
      tiles: state.tiles,
      armies: state.armies,
      factions: state.factions,
      customTerrains: state.terrainConfig.custom,
      riverTypes: state.terrainConfig.riverTypes,
      roadTypes: state.terrainConfig.roadTypes,
      area,
      overlay,
    });
    setBaseCanvas(base);
  }, [area, overlay, store]);

  // Escape leaves the export view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pendingArea === null) handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [handleBack, pendingArea]);

  const applyArea = (next: PngExportArea) => {
    setArea(next);
    setStrokes([]);
    setRedoStack([]);
  };

  // Switching area invalidates strokes drawn against the old render — confirm
  // first when there is annotation work to lose.
  const handleSetArea = (next: PngExportArea) => {
    if (next === area) return;
    if (strokes.length > 0) {
      setPendingArea(next);
      return;
    }
    applyArea(next);
  };

  const handleStrokesChange = (next: DrawStroke[]) => {
    setStrokes(next);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    setRedoStack((r) => {
      return [...r, strokes[strokes.length - 1]];
    });
    setStrokes((s) => {
      return s.slice(0, -1);
    });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const item = redoStack[redoStack.length - 1];
    setRedoStack((r) => {
      return r.slice(0, -1);
    });
    setStrokes((s) => {
      return [...s, item];
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  const handleDownload = () => {
    const state = store.getState();
    const baseName = state.currentMap.name || 'hex-map';
    const now = new Date();
    const pad = (n: number) => {
      return String(n).padStart(2, '0');
    };
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}-${pad(now.getMinutes())}`;
    exportMapPng({
      tiles: state.tiles,
      armies: state.armies,
      factions: state.factions,
      customTerrains: state.terrainConfig.custom,
      riverTypes: state.terrainConfig.riverTypes,
      roadTypes: state.terrainConfig.roadTypes,
      area,
      overlay,
      strokes,
      fileName: `${baseName} ${stamp}`,
    });
  };

  return (
    <AppShell data-testid="export-png-view">
      <ExportHeader mapName={mapName} onBack={handleBack} />
      <Body>
        <AnnotationStage
          baseCanvas={baseCanvas}
          strokes={strokes}
          color={color}
          width={width}
          onChange={handleStrokesChange}
        />
      </Body>
      <ExportEditPanel
        area={area}
        onSetArea={handleSetArea}
        overlay={overlay}
        color={color}
        onSetColor={setColor}
        width={width}
        onSetWidth={setWidth}
        canUndo={strokes.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        hasTiles={hasTiles}
        onDownload={handleDownload}
        onClose={handleBack}
      />
      <ConfirmModal
        open={pendingArea !== null}
        title={t('exportPng.switchAreaTitle')}
        message={t('exportPng.switchAreaMessage')}
        confirmLabel={t('exportPng.switchAreaConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          if (pendingArea) applyArea(pendingArea);
          setPendingArea(null);
        }}
        onCancel={() => {
          return setPendingArea(null);
        }}
      />
    </AppShell>
  );
};

export default ExportPngView;
