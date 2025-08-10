// i18n initialization for the app
// Comments are in English per project guidelines
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { detectLocale, en, ua, type Locale } from '@/shared/locales';

/**
 * Get initial language: localStorage -> browser -> fallback 'ua'
 */
const getInitialLanguage = (): Locale => {
  try {
    const stored = localStorage.getItem('app-language');
    if (stored === 'ua' || stored === 'en') return stored;
  } catch {
    // ignore read errors (e.g., SSR or privacy mode)
  }
  return detectLocale();
};

// i18next resource structure mirrors existing nested keys
const resources = {
  ua: { translation: ua },
  en: { translation: en },
} as const;

// Initialize i18next only once
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: 'ua',
      interpolation: {
        escapeValue: false, // React already escapes
      },
      // Keep keys as-is, we use nested objects
      keySeparator: '.',
      defaultNS: 'translation',
      ns: ['translation'],
    })
    .catch(() => {
      // no-op: avoid breaking app on init errors
    });
}

export { i18n };
