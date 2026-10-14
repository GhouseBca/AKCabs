"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { en, type TranslationKey, type Translations } from "@/lib/i18n/en";
import { ta } from "@/lib/i18n/ta";

export type Language = "en" | "ta";

const STORAGE_KEY = "akcabs-lang";
const CHANGE_EVENT = "akcabs-lang-change";

const DICTIONARIES: Record<Language, Translations> = { en, ta };

export type TranslateVars = Record<string, string | number>;

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: TranslateVars) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "ta" ? "ta" : "en";
  } catch {
    return "en";
  }
}

function getServerLanguage(): Language {
  return "en";
}

function subscribeToLanguage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(
    subscribeToLanguage,
    readStoredLanguage,
    getServerLanguage,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.classList.toggle("lang-ta", lang === "ta");

    return () => {
      root.lang = "en";
      root.classList.remove("lang-ta");
    };
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage access errors (private mode, disabled storage).
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: TranslateVars) => {
      const dictionary = DICTIONARIES[lang] ?? en;
      let value = dictionary[key] ?? en[key] ?? key;

      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.replaceAll(`{${name}}`, String(replacement));
        }
      }

      return value;
    },
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t }),
    [lang, setLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
