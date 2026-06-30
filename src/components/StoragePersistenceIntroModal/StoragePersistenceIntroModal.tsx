import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ModalBackdrop, ModalCard, ModalTitle } from '../shared/modal';

const Message = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin: 0;
  line-height: 1.5;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const DismissButton = styled.button`
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

const EnableButton = styled.button`
  flex: 1;
  padding: 9px 12px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.ui.success;
    }};
  background: ${({ theme }) => {
    return theme.ui.success;
  }};
  color: ${({ theme }) => {
    return theme.panelBackground;
  }};
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.88;
  }
`;

interface StoragePersistenceIntroModalProps {
  open: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export const StoragePersistenceIntroModal = ({
  open,
  onEnable,
  onDismiss,
}: StoragePersistenceIntroModalProps): React.ReactElement | null => {
  const { t } = useTranslation();
  if (!open) return null;

  // Backdrop click is intentionally inert — an accidental outside click shouldn't
  // permanently dismiss the explainer (closing marks it as seen forever). The user
  // must choose "Not now" or "Enable".
  return (
    <ModalBackdrop data-testid="persistence-intro-modal">
      <ModalCard>
        <ModalTitle>{t('storagePersistence.introTitle')}</ModalTitle>
        <Message>{t('storagePersistence.introBody')}</Message>
        <ButtonRow>
          <DismissButton data-testid="persistence-intro-dismiss-btn" onClick={onDismiss}>
            {t('storagePersistence.notNow')}
          </DismissButton>
          <EnableButton data-testid="persistence-intro-enable-btn" onClick={onEnable}>
            {t('storagePersistence.enable')}
          </EnableButton>
        </ButtonRow>
      </ModalCard>
    </ModalBackdrop>
  );
};
