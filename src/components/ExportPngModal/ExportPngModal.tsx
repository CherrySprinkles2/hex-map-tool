import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppStore } from '../../app/hooks';
import { ModalBackdrop, ModalCard, ModalTitle, ModalOptionButton } from '../shared/modal';
import { exportMapPng, renderMapPngCanvas } from '../../utils/exportPng';
import type { PngExportArea } from '../../utils/exportPng';

const PREVIEW_W = 520;
const PREVIEW_H = 300;

const WideCard = styled(ModalCard)`
  width: min(580px, 94vw);
`;

const OverlayLabel = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
`;

const PreviewBox = styled.div`
  width: 100%;
  background: repeating-conic-gradient(
      ${({ theme }) => {
          return theme.surface.subtle;
        }}
        0% 25%,
      transparent 0% 50%
    )
    50% / 20px 20px;
  border: 1px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewCanvas = styled.canvas`
  display: block;
  width: 100%;
  height: auto;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 9px 12px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }
`;

const DownloadBtn = styled.button`
  flex: 1;
  padding: 9px 12px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.borderFocus;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ExportPngModalProps {
  open: boolean;
  onClose: () => void;
}

export const ExportPngModal = ({
  open,
  onClose,
}: ExportPngModalProps): React.ReactElement | null => {
  const { t } = useTranslation();
  const store = useAppStore();
  const [area, setArea] = useState<PngExportArea>('full');
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const hasTiles = useAppSelector((state) => {
    return Object.keys(state.tiles).length > 0;
  });
  const overlay = useAppSelector((state) => {
    return state.ui.overlay;
  });

  // Render the preview whenever the modal is open or any export option changes.
  useEffect(() => {
    if (!open) return;
    const canvas = previewRef.current;
    if (!canvas) return;
    const pctx = canvas.getContext('2d');
    if (!pctx) return;
    pctx.clearRect(0, 0, canvas.width, canvas.height);

    const state = store.getState();
    const full = renderMapPngCanvas({
      tiles: state.tiles,
      armies: state.armies,
      factions: state.factions,
      customTerrains: state.terrainConfig.custom,
      riverTypes: state.terrainConfig.riverTypes,
      roadTypes: state.terrainConfig.roadTypes,
      area,
      overlay,
    });
    if (!full || full.width === 0 || full.height === 0) return;

    const scale = Math.min(canvas.width / full.width, canvas.height / full.height);
    const w = full.width * scale;
    const h = full.height * scale;
    pctx.drawImage(full, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  }, [open, area, overlay, store]);

  if (!open) return null;

  const handleDownload = () => {
    const state = store.getState();
    exportMapPng({
      tiles: state.tiles,
      armies: state.armies,
      factions: state.factions,
      customTerrains: state.terrainConfig.custom,
      riverTypes: state.terrainConfig.riverTypes,
      roadTypes: state.terrainConfig.roadTypes,
      area,
      overlay,
      fileName: state.currentMap.name || 'hex-map',
    });
    onClose();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <WideCard
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <ModalTitle>{t('exportPng.title')}</ModalTitle>
        <OverlayLabel data-testid="export-png-overlay-label">
          {t('exportPng.exportingAs', { overlay: t(`overlayPanel.${overlay}`) })}
        </OverlayLabel>
        <PreviewBox>
          <PreviewCanvas
            ref={previewRef}
            width={PREVIEW_W}
            height={PREVIEW_H}
            data-testid="export-png-preview"
          />
        </PreviewBox>
        <ModalOptionButton
          data-testid="export-png-area-full"
          $active={area === 'full'}
          onClick={() => {
            return setArea('full');
          }}
        >
          {t('exportPng.fullMap')}
        </ModalOptionButton>
        <ModalOptionButton
          data-testid="export-png-area-viewport"
          $active={area === 'viewport'}
          onClick={() => {
            return setArea('viewport');
          }}
        >
          {t('exportPng.currentView')}
        </ModalOptionButton>
        <ButtonRow>
          <CancelBtn onClick={onClose}>{t('common.cancel')}</CancelBtn>
          <DownloadBtn
            data-testid="export-png-download-btn"
            disabled={!hasTiles}
            onClick={handleDownload}
          >
            {t('exportPng.download')}
          </DownloadBtn>
        </ButtonRow>
      </WideCard>
    </ModalBackdrop>
  );
};
