import { memo, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="recipe-viewer-content">
          <div className="recipe-viewer-title-row">
            <h2>{t("chefRecommends")}</h2>
            {isSaved && (
              <span className="recipe-viewer-saved">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
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