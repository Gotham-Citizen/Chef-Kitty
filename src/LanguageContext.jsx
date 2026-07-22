import { createContext, useContext, useState, useEffect } from "react"
import { detectLanguage, t as translate } from "./i18n"

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => detectLanguage())

  useEffect(() => {
    document.documentElement.lang = language
    document.title = translate("appTitle", language)
  }, [language])

  const t = (key, args) => translate(key, language, args)

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}
