import { memo, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { CloseIcon, BookmarkIcon } from "./Icons"

const markdownCache = new Map()
const MAX_CACHE = 50

function trimCache() {
  if (markdownCache.size > MAX_CACHE) {
    markdownCache.delete(markdownCache.keys().next().value)
  }
}

function LazyMarkdown({ content, t }) {
  const [parsed, setParsed] = useState(() => {
    const cached = markdownCache.get(content)
    return cached || null
  })

  useEffect(() => {
    if (parsed) return
    const id = setTimeout(() => {
      const el = <ReactMarkdown>{content}</ReactMarkdown>
      markdownCache.set(content, el)
      trimCache()
      setParsed(el)
    }, 0)
    return () => clearTimeout(id)
  }, [content, parsed])

  if (parsed) return parsed
  return (
    <div className="recipe-viewer-loading">
      <span className="recipe-viewer-spinner" aria-hidden="true" />
      {t("loading")}
    </div>
  )
}

function RecipeViewer({ recipe, onClose, t, isSaved, onSave }) {
  if (!recipe) return null

  return (
    <div className="recipe-viewer-overlay" onClick={onClose}>
      <div className="recipe-viewer-modal" onClick={e => e.stopPropagation()}>
        <button className="recipe-viewer-close" onClick={onClose}>
          <CloseIcon size={24} />
        </button>
        <div className="recipe-viewer-content">
          <div className="recipe-viewer-title-row">
            <h2>{t("chefRecommends")}</h2>
            {isSaved && (
              <span className="recipe-viewer-saved">
                <BookmarkIcon filled />
                {t("saved")}
              </span>
            )}
          </div>
          <LazyMarkdown key={recipe} content={recipe} t={t} />
          {!isSaved && onSave && (
            <button className="save-recipe-btn" onClick={onSave}>
              {t("saveRecipe")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(RecipeViewer)