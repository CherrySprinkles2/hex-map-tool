import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { ModalBackdrop, ModalCard, ModalTitle } from '../shared/modal';

const Message = styled.p`
  font-size: 0.88rem;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
  margin: 0;
  line-height: 1.5;

  strong {
    color: ${({ theme }) => {
      return theme.text;
    }};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const SnoozeBtn = styled.button`
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

const ExportBtn = styled.button`
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

interface ExportReminderModalProps {
  open: boolean;
  mapName: string;
  onExport: () => void;
  onSnooze: () => void;
}

export const ExportReminderModal = ({
  open,
  mapName,
  onExport,
  onSnooze,
}: ExportReminderModalProps): React.ReactElement | null => {
  const { t } = useTranslation();
  if (!open) return null;

  // Backdrop click is intentionally inert — an accidental outside click shouldn't
  // commit a 7-day snooze. The user must choose "No thanks" or "Export now".
  return (
    <ModalBackdrop data-testid="export-reminder-modal">
      <ModalCard>
        <ModalTitle>{t('exportReminder.title')}</ModalTitle>
        <Message>
          <Trans
            i18nKey="exportReminder.body"
            values={{ name: mapName }}
            components={{ bold: <strong /> }}
          />
        </Message>
        <ButtonRow>
          <SnoozeBtn data-testid="export-reminder-snooze-btn" onClick={onSnooze}>
            {t('exportReminder.snooze')}
          </SnoozeBtn>
          <ExportBtn data-testid="export-reminder-export-btn" onClick={onExport}>
            {t('exportReminder.export')}
          </ExportBtn>
        </ButtonRow>
      </ModalCard>
    </ModalBackdrop>
  );
};
