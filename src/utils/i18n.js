import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en/translation";
import zhTranslations from "./locales/zh/translation";
import esTranslations from "./locales/es/translation";
import INGREDIENTS from "../ingredients";

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

const ES_ITEMS = INGREDIENTS.es.map(s => s.toLowerCase())
const EN_ITEMS = INGREDIENTS.en.map(s => s.toLowerCase())

export function detectInputLanguage(textArr, uiLanguage = "en") {
  const combined = textArr.join(" ")
  if (/[\u4e00-\u9fff]/.test(combined)) return "zh"
  if (/[ñáéíóúü]/.test(combined)) return "es"

  const items = textArr.map(s => s.trim().toLowerCase()).filter(Boolean)
  let esHits = 0
  let enHits = 0
  for (const item of items) {
    const inEs = ES_ITEMS.some(w => item.includes(w) || w.includes(item))
    const inEn = EN_ITEMS.some(w => item.includes(w) || w.includes(item))
    if (inEs && !inEn) esHits++
    else if (inEn && !inEs) enHits++
  }
  if (esHits > enHits) return "es"
  if (enHits > esHits) return "en"
  if ((uiLanguage || "").toLowerCase().startsWith("es")) return "es"
  return "en"
}

export default i18n
