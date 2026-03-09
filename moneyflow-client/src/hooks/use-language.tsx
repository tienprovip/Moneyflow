import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  type TranslationKey,
  getTranslation,
} from "@/i18n/translations";

interface LanguageContextType {
  locale: Locale;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "vi",
  toggleLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("moneyflow-lang") as Locale) || "vi";
    }
    return "vi";
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "vi" ? "en" : "vi";
      localStorage.setItem("moneyflow-lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey) => getTranslation(key, locale),
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
