import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from 'react-i18next';

function KittyRecipe({recipe}) {
  const { t } = useTranslation()
  return (
    <section className='suggested-recipe-container' aria-live='polite'>
      <h2>{t("chefRecommends")} </h2>
      <ReactMarkdown>{recipe}</ReactMarkdown>
    </section>
  )
}

export default memo(KittyRecipe)