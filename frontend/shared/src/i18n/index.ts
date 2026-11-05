import en from './locales/en.json' with { type: 'json' };
import hi from './locales/hi.json' with { type: 'json' };
import ar from './locales/ar.json' with { type: 'json' };

export type Locale = 'en' | 'hi' | 'ar';

export const locales: Record<Locale, typeof en> = {
  en,
  hi,
  ar,
};

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  ar: 'العربية',
};

export const defaultLocale: Locale = 'en';

export const rtlLocales: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getTranslation(locale: Locale = defaultLocale) {
  return locales[locale] || locales[defaultLocale];
}

// Type for translation keys (nested paths like "errors.invalid_email")
export type TranslationKeys = typeof en;

export { en, hi, ar };
