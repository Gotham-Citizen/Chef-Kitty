import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en/translation";
import zhTranslations from "./locales/zh/translation";
import esTranslations from "./locales/es/translation";

const resources = {
  ...enTranslations,
  ...zhTranslations,
  ...esTranslations,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
  });

export function detectInputLanguage(textArr, uiLanguage = "en") {
  const combined = textArr.join(" ")
  const hasChinese = /[\u4e00-\u9fff]/.test(combined)
  if (hasChinese) return "zh"
  if ((uiLanguage || "").toLowerCase().startsWith("es")) return "es"
  return "en"
}

export default i18n
