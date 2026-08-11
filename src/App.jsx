import { useState, useCallback, useEffect } from "react"
import { useTranslation } from 'react-i18next';
import Header from "../components/Header"
import Main from "../components/Main"
import i18n from "./utils/i18n"

export default function App () {
  const [isRecipesModalOpen, setIsRecipesModalOpen] = useState(false)
  const [isHistory, setIsHistory] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.title = t("appTitle")
    const handleLanguageChanged = (lng) => {
      document.documentElement.lang = lng
      document.title = t("appTitle")
    }
    i18n.on("languageChanged", handleLanguageChanged)
    return () => {
      i18n.off("languageChanged", handleLanguageChanged)
    }
  }, [t])

  const openHistory = useCallback(() => {
    setIsHistory(true)
    setIsRecipesModalOpen(true)
  }, [])

  const openSaved = useCallback(() => {
    setIsHistory(false)
    setIsRecipesModalOpen(true)
  }, [])

  const closeRecipesModal = useCallback(() => setIsRecipesModalOpen(false), [])

  return (
    <>
      <Header onHistoryClick={openHistory} onSavedClick={openSaved} />
      <Main isRecipesModalOpen={isRecipesModalOpen} onCloseRecipesModal={closeRecipesModal} isHistory={isHistory} />
    </>
  )
}
