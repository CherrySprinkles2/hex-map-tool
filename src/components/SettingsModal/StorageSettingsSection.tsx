import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useStoragePersistence } from '../../hooks/useStoragePersistence';
import { formatBytes } from '../../utils/formatBytes';
import { SettingsSection, SettingsSectionHeading } from './SettingsSection';

const Status = styled.p<{ $persisted: boolean }>`
  font-size: 0.85rem;
  line-height: 1.45;
  margin: 0;
  color: ${({ $persisted, theme }) => {
    return $persisted ? theme.text : theme.textMuted;
  }};
`;

const Usage = styled.p`
  font-size: 0.8rem;
  margin: 0;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
`;

const EnableButton = styled.button`
  align-self: flex-start;
  padding: 8px 14px;
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
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.88;
  }
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const StorageSettingsSection = (): React.ReactElement => {
  const { t } = useTranslation();
  const { supported, persisted, usageBytes, loading, enable } = useStoragePersistence(true);

  let status: string;
  if (!supported) {
    status = t('storagePersistence.statusUnsupported');
  } else if (persisted) {
    status = t('storagePersistence.statusPersisted');
  } else {
    status = t('storagePersistence.statusNotPersisted');
  }

  return (
    <SettingsSection data-testid="storage-section">
      <SettingsSectionHeading>{t('settings.storageHeading')}</SettingsSectionHeading>
      <Status data-testid="storage-section-status" $persisted={persisted}>
        {status}
      </Status>
      {usageBytes !== null && (
        <Usage data-testid="storage-section-usage">
          {t('storagePersistence.usage', { used: formatBytes(usageBytes) })}
        </Usage>
      )}
      {supported && !persisted && (
        <EnableButton
          data-testid="storage-section-enable-btn"
          disabled={loading}
          onClick={() => {
            return void enable();
          }}
        >
          {t('storagePersistence.enable')}
        </EnableButton>
      )}
    </SettingsSection>
  );
};
