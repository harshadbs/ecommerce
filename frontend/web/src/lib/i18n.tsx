'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Import translations
import { en, hi, ar } from '@ecommerce/shared/i18n';

export type Locale = 'en' | 'hi' | 'ar';

const translations: Record<Locale, typeof en> = { en, hi, ar };

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  ar: 'العربية',
};

const rtlLocales: Locale[] = ['ar'];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return key if not found
    }
  }

  return typeof result === 'string' ? result : path;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && translations[savedLocale]) {
      setLocaleState(savedLocale);
      setIsRTL(rtlLocales.includes(savedLocale));
      document.documentElement.dir = rtlLocales.includes(savedLocale) ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLocale;
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setIsRTL(rtlLocales.includes(newLocale));
    localStorage.setItem('locale', newLocale);
    document.documentElement.dir = rtlLocales.includes(newLocale) ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation = getNestedValue(translations[locale] as Record<string, unknown>, key);

      // Replace parameters like {count}, {amount}, etc.
      if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
          translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
        });
      }

      return translation;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRTL }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook for just translation function
export function useTranslation() {
  const { t, locale, isRTL } = useI18n();
  return { t, locale, isRTL };
}
