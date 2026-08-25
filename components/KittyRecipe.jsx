import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTranslation } from 'react-i18next';
import { normalizeMarkdown } from '../src/utils/markdown'

function KittyRecipe({recipe, photo, dishName, dishNameEn, sectionRef}) {
  const { t } = useTranslation()
  return (
    <section className='suggested-recipe-container' ref={sectionRef} aria-live='polite'>
      <h2>{t("chefRecommends")} </h2>
      {photo && <img className="recipe-photo" src={photo} alt={dishName || dishNameEn || t("dishPhotoAlt")} />}
      <ReactMarkdown>{normalizeMarkdown(recipe)}</ReactMarkdown>
    </section>
  )
}

export default memo(KittyRecipe)