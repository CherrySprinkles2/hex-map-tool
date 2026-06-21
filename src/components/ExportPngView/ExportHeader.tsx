import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../shared/LanguageToggle';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: ${({ theme }) => {
    return theme.panelBackground;
  }};
  border-bottom: 2px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  z-index: ${({ theme }) => {
    return theme.zIndex.toolbar;
  }};
  flex-shrink: 0;
`;

const BackBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1.5px solid
    ${({ theme }) => {
      return theme.panelBorder;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  font-size: 0.8rem;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;
  &:hover {
    background: ${({ theme }) => {
      return theme.panelBorder;
    }};
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const MapName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${({ theme }) => {
    return theme.text;
  }};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface ExportHeaderProps {
  mapName: string;
  onBack: () => void;
}

export const ExportHeader = ({ mapName, onBack }: ExportHeaderProps): React.ReactElement => {
  const { t } = useTranslation();
  return (
    <Bar>
      <BackBtn onClick={onBack} data-testid="export-back-btn">
        {t('toolbar.back')}
      </BackBtn>
      <MapName data-testid="export-map-name">{mapName}</MapName>
      <LanguageToggle />
    </Bar>
  );
};
