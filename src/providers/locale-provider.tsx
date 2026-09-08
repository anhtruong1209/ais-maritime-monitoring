"use client";

import { createContext, useContext, useState } from "react";
import { VI_DICTIONARY } from "@/lib/i18n/vi-dictionary";

export type Locale = "vi" | "en";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate an English UI string. Falls through to the English text
   * itself when the locale is "en" or when no Vietnamese entry exists yet
   * — so nothing breaks while the dictionary is filled in incrementally. */
  t: (text: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "ais-locale";

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "vi";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" ? "en" : "vi";
  } catch {
    return "vi";
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer (see sidebar-provider.tsx for the same pattern): reads
  // the real preference on first client render instead of via an effect.
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore — the choice still applies for this session via state alone.
    }
  }

  function t(text: string): string {
    if (locale === "en") return text;
    return VI_DICTIONARY[text] ?? text;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
