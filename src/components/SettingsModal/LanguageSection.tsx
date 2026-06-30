import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { ModalOptionButton } from '../shared/modal';
import { SettingsSection, SettingsSectionHeading } from './SettingsSection';

export const LanguageSection = (): React.ReactElement => {
  const { t } = useTranslation();
  const { currentLang, handleLanguageSelect } = useLanguage();

  const select = (lang: string): void => {
    handleLanguageSelect(lang);
  };

  return (
    <SettingsSection data-testid="language-section">
      <SettingsSectionHeading>{t('settings.languageHeading')}</SettingsSectionHeading>
      <ModalOptionButton
        data-testid="language-en-btn"
        $active={currentLang === 'en'}
        onClick={() => {
          return select('en');
        }}
      >
        🇬🇧 English
      </ModalOptionButton>
      <ModalOptionButton
        data-testid="language-fi-btn"
        $active={currentLang === 'fi'}
        onClick={() => {
          return select('fi');
        }}
      >
        🇫🇮 Suomi
      </ModalOptionButton>
    </SettingsSection>
  );
};
