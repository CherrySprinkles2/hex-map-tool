import i18n from '../i18n';

export const useLanguage = (): {
  currentLang: string;
  handleLanguageSelect: (lang: string) => void;
} => {
  const currentLang = i18n.language.startsWith('fi') ? 'fi' : 'en';

  const handleLanguageSelect = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return { currentLang, handleLanguageSelect };
};
