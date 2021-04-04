import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh',
    lng: 'zh',
    debug: true,
    resources: {
      zh: {
        translation: {
          language: '语言',
          changelanguage: '切换语言'
        }
      },
      en: {
        translation: {
          language: 'language',
          changelanguage: 'changelanguage'
        }
      }
    },
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    }
  });

export default i18n;
