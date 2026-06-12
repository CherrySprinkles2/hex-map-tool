import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppStore } from '../../app/hooks';
import { ModalBackdrop, ModalCard, ModalTitle, ModalOptionButton } from '../shared/modal';
import { exportMapPng } from '../../utils/exportPng';
import type { PngExportArea } from '../../utils/exportPng';

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 4px;
  font-size: 0.85rem;
  color: ${({ theme }) => {
    return theme.text;
  }};
  cursor: pointer;
  user-select: none;

  input {
    cursor: pointer;
  }
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
  const [includeFactionBorders, setIncludeFactionBorders] = useState(false);
  const hasTiles = useAppSelector((state) => {
    return Object.keys(state.tiles).length > 0;
  });
  const hasFactions = useAppSelector((state) => {
    return state.factions.length > 0;
  });

  if (!open) return null;

  const handleDownload = () => {
    const state = store.getState();
    exportMapPng({
      tiles: state.tiles,
      armies: state.armies,
      factions: state.factions,
      customTerrains: state.terrainConfig.custom,
      area,
      includeFactionBorders,
      fileName: state.currentMap.name || 'hex-map',
    });
    onClose();
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalCard
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <ModalTitle>{t('exportPng.title')}</ModalTitle>
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
        {hasFactions && (
          <CheckboxRow>
            <input
              type="checkbox"
              data-testid="export-png-borders-checkbox"
              checked={includeFactionBorders}
              onChange={(e) => {
                return setIncludeFactionBorders(e.target.checked);
              }}
            />
            {t('exportPng.includeFactionBorders')}
          </CheckboxRow>
        )}
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
      </ModalCard>
    </ModalBackdrop>
  );
};
