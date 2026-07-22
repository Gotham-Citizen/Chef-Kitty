import ReactMarkdown from 'react-markdown'
import { useLanguage } from "../src/LanguageContext"

export default function ClaudeRecipe({recipe}) {
  const { t } = useLanguage()
  return (
    <section className='suggested-recipe-container' aria-live='polite'>
      <h2>{t("chefRecommends")} </h2>
      <ReactMarkdown>{recipe}</ReactMarkdown>
    </section>
  )
}