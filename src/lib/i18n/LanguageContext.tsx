"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Lang = "en" | "bn";

const dict = {
  en: {
    home: "Home",
    cards: "Cards",
    track: "Track Order",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    login: "Login",
    register: "Register",
  },
  bn: {
    home: "হোম",
    cards: "কার্ড",
    track: "অর্ডার ট্র্যাক",
    about: "আমাদের সম্পর্কে",
    contact: "যোগাযোগ",
    cart: "কার্ট",
    login: "লগইন",
    register: "রেজিস্টার",
  },
} as const;

type DictKey = keyof typeof dict.en;

interface Ctx {
  language: Lang;
  setLanguage: (l: Lang) => void;
  t: (key: DictKey) => string;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Lang>("en");
  const t = useCallback(
    (key: DictKey) => dict[language][key] ?? dict.en[key] ?? key,
    [language]
  );
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en" as Lang,
      setLanguage: () => {},
      t: (k: DictKey) => dict.en[k] ?? k,
    };
  }
  return ctx;
}
