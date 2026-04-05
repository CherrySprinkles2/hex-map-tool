import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { InitOptions } from 'i18next';
import en from './locales/en.json';
import fi from './locales/fi.json';

const options: InitOptions = {
  resources: {
    en: { translation: en },
    fi: { translation: fi },
  },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ...options,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  } as InitOptions);

export default i18n;
