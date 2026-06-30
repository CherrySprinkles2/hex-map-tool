import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SettingsSection, SettingsSectionHeading } from './SettingsSection';
import { downloadBugReport } from '../../utils/bugReport';

const Description = styled.p`
  font-size: 0.8rem;
  line-height: 1.45;
  margin: 0;
  color: ${({ theme }) => {
    return theme.textMuted;
  }};
`;

const ReportButton = styled.button`
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 6px;
  border: 2px solid
    ${({ theme }) => {
      return theme.surface.border;
    }};
  background: transparent;
  color: ${({ theme }) => {
    return theme.text;
  }};
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: ${({ theme }) => {
      return theme.surface.hover;
    }};
  }
`;

export const BugReportSection = (): React.ReactElement => {
  const { t } = useTranslation();

  const handleClick = (): void => {
    downloadBugReport();
  };

  return (
    <SettingsSection data-testid="bug-report-section">
      <SettingsSectionHeading>{t('settings.bugReportHeading')}</SettingsSectionHeading>
      <Description>{t('bugReport.description')}</Description>
      <ReportButton data-testid="create-bug-report-btn" onClick={handleClick}>
        {t('bugReport.button')}
      </ReportButton>
    </SettingsSection>
  );
};
