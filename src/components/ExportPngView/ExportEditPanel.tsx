import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SidePanel } from '../shared/SidePanel';
import { PanelHeader } from '../shared/PanelHeader';
import { SectionLabel } from '../shared/SectionLabel';
import { ButtonGroup } from '../shared/ButtonGroup';
import { ModalOptionButton } from '../shared/modal';
import { DownloadIcon } from '../../assets/icons/ui';
import type { PngExportArea } from '../../utils/exportPng';
import type { Overlay } from '../../types/state';

// Freehand palette — distinct hues so multiple plans read clearly against the map.
export const PALETTE = ['#e63946', '#1d75e0', '#2a9d4a', '#f4c20d', '#111111', '#ffffff'];
export const MIN_WIDTH = 0.002; // fraction of canvas width
export const MAX_WIDTH = 0.02;
export const DEFAULT_WIDTH = 0.006;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const OverlayValue = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => {
    return theme.text;
  }};
`;

const SwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Swatch = styled.button<{ $color: string; $active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  background: ${({ $color }) => {
    return $color;
  }};
  border: 2px solid
    ${({ $active, theme }) => {
      return $active ? theme.surface.borderFocus : 'rgba(0,0,0,0.35)';
    }};
  box-shadow: ${({ $active }) => {
    return $active ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none';
  }};
  transition: box-shadow 0.15s;
`;

const WidthRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const WidthSlider = styled.input`
  flex: 1;
  cursor: pointer;
`;

const ToolRow = styled.div`
  display: flex;
  gap: 8px;
`;

const ToolBtn = styled.button`
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const DownloadBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 12px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.borderFocus;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.9rem;
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

interface ExportEditPanelProps {
  area: PngExportArea;
  onSetArea: (area: PngExportArea) => void;
  overlay: Overlay;
  color: string;
  onSetColor: (color: string) => void;
  width: number;
  onSetWidth: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  hasTiles: boolean;
  onDownload: () => void;
  onClose: () => void;
}

export const ExportEditPanel = ({
  area,
  onSetArea,
  overlay,
  color,
  onSetColor,
  width,
  onSetWidth,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  hasTiles,
  onDownload,
  onClose,
}: ExportEditPanelProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <SidePanel $open $desktopVisible $mobileHeight="50vh" data-testid="export-edit-panel">
      <PanelHeader title={t('exportPng.title')} onClose={onClose} closeDesktopHidden />

      <Section>
        <SectionLabel>{t('exportPng.area')}</SectionLabel>
        <ButtonGroup>
          <ModalOptionButton
            data-testid="export-area-full"
            $active={area === 'full'}
            onClick={() => {
              return onSetArea('full');
            }}
          >
            {t('exportPng.fullMap')}
          </ModalOptionButton>
          <ModalOptionButton
            data-testid="export-area-viewport"
            $active={area === 'viewport'}
            onClick={() => {
              return onSetArea('viewport');
            }}
          >
            {t('exportPng.currentView')}
          </ModalOptionButton>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionLabel>{t('exportPng.overlayLabel')}</SectionLabel>
        <OverlayValue data-testid="export-overlay-label">
          {t('exportPng.exportingAs', { overlay: t(`overlayPanel.${overlay}`) })}
        </OverlayValue>
      </Section>

      <Section>
        <SectionLabel>{t('exportPng.annotate')}</SectionLabel>
        <SwatchRow>
          {PALETTE.map((c) => {
            return (
              <Swatch
                key={c}
                $color={c}
                $active={c === color}
                data-testid={`draw-color-${c}`}
                onClick={() => {
                  return onSetColor(c);
                }}
                aria-label={c}
              />
            );
          })}
        </SwatchRow>
        <WidthRow>
          <SectionLabel as="span">{t('exportPng.width')}</SectionLabel>
          <WidthSlider
            type="range"
            min={MIN_WIDTH * 1000}
            max={MAX_WIDTH * 1000}
            value={width * 1000}
            data-testid="draw-width-slider"
            onChange={(e) => {
              return onSetWidth(Number(e.target.value) / 1000);
            }}
          />
        </WidthRow>
        <ToolRow>
          <ToolBtn data-testid="draw-undo-btn" disabled={!canUndo} onClick={onUndo}>
            {t('exportPng.undo')}
          </ToolBtn>
          <ToolBtn data-testid="draw-redo-btn" disabled={!canRedo} onClick={onRedo}>
            {t('exportPng.redo')}
          </ToolBtn>
          <ToolBtn data-testid="draw-clear-btn" disabled={!canUndo} onClick={onClear}>
            {t('exportPng.clear')}
          </ToolBtn>
        </ToolRow>
      </Section>

      <Spacer />

      <DownloadBtn data-testid="export-download-btn" disabled={!hasTiles} onClick={onDownload}>
        <DownloadIcon width="1em" height="1em" aria-hidden />
        {t('exportPng.download')}
      </DownloadBtn>
    </SidePanel>
  );
};
