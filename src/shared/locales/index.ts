import { en } from './en';
import { ua } from './ua';

export const locales = {
  ua,
  en,
};

export type Locale = keyof typeof locales;
export type Translations = typeof ua;

export const defaultLocale: Locale = 'ua';

// Detect user's preferred language
export const detectLocale = (): Locale => {
  const browserLang = navigator.language.toLowerCase();

  if (browserLang.startsWith('uk') || browserLang.startsWith('ua')) {
    return 'ua';
  }

  if (browserLang.startsWith('en')) {
    return 'en';
  }

  return defaultLocale;
};

export { ua, en };
