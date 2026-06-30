import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ModalBackdrop, ModalCard, ModalTitle } from '../shared/modal';
import { StorageSettingsSection } from './StorageSettingsSection';
import { OrientationSection } from './OrientationSection';
import { LanguageSection } from './LanguageSection';
import { BugReportSection } from './BugReportSection';

const Card = styled(ModalCard)`
  width: min(420px, 92vw);
  max-height: 85vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  margin-top: 4px;
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

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps): React.ReactElement | null => {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <ModalBackdrop data-testid="settings-modal" onClick={onClose}>
      <Card
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        <ModalTitle>{t('settings.title')}</ModalTitle>
        <StorageSettingsSection />
        <OrientationSection />
        <LanguageSection />
        <BugReportSection />
        <CloseButton data-testid="settings-modal-close-btn" onClick={onClose}>
          {t('settings.close')}
        </CloseButton>
      </Card>
    </ModalBackdrop>
  );
};
