// Native i18next translation hook wrapper
// Comments are in English per project guidelines
import { useTranslation as useI18NextTranslation } from 'react-i18next';

import type { Locale } from '../locales';

import './i18n';

/**
 * Hook returning native i18next t, current locale and setter.
 */
export const useTranslation = () => {
  const { i18n: i18nextInstance, t } = useI18NextTranslation();

  const setLocale = (locale: Locale) => {
    try {
      localStorage.setItem('app-language', locale);
    } catch {
      // ignore storage errors
    }
    i18nextInstance.changeLanguage(locale);
  };

  return {
    locale: i18nextInstance.language as Locale,
    setLocale,
    t, // use as t('namespace.key')
  };
};
