import { create } from 'zustand';
import { locales, type Locale, type Translations, detectLocale } from '../locales';

interface TranslationState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const getStoredLocale = (): Locale => {
  const stored = localStorage.getItem('app-language');
  if (stored && (stored === 'ua' || stored === 'en')) {
    return stored as Locale;
  }
  return detectLocale();
};

export const useTranslation = create<TranslationState>((set) => ({
  locale: getStoredLocale(),
  setLocale: (locale: Locale) => {
    localStorage.setItem('app-language', locale);
    set({
      locale,
      t: locales[locale]
    });
  },
  t: locales[getStoredLocale()]
}));

// Helper hook to get current translations
export const useT = () => {
  const t = useTranslation((state) => state.t);
  return t;
};
