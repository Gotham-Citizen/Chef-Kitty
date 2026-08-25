import { memo, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { CloseIcon, BookmarkIcon, DownloadIcon, ShareIcon } from "./Icons"
import Modal from "./Modal"
import { downloadRecipe, shareRecipe, extractTitle } from "../src/utils/recipeShare"
import { normalizeMarkdown } from "../src/utils/markdown"

const markdownCache = new Map()
const MAX_CACHE = 50

function trimCache() {
  if (markdownCache.size > MAX_CACHE) {
    markdownCache.delete(markdownCache.keys().next().value)
  }
}

function LazyMarkdown({ content, t }) {
  const [parsed, setParsed] = useState(() => {
    const cached = markdownCache.get(normalizeMarkdown(content))
    return cached || null
  })

  useEffect(() => {
    if (parsed) return
    const normalized = normalizeMarkdown(content)
    const id = setTimeout(() => {
      const el = <ReactMarkdown>{normalized}</ReactMarkdown>
      markdownCache.set(normalized, el)
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

function RecipeViewer({ recipe, onClose, t, isSaved, onSave, photo, dishName, dishNameEn }) {
  const [shareFeedback, setShareFeedback] = useState("")
  const [shareFeedbackIsError, setShareFeedbackIsError] = useState(false)
  if (!recipe) return null

  async function handleShare() {
    const title = dishName || extractTitle(recipe) || ""
    const result = await shareRecipe(recipe, title)
    if (!result) {
      setShareFeedback(t("copyFailed"))
      setShareFeedbackIsError(true)
      setTimeout(() => setShareFeedback(""), 3000)
    }
  }

  return (
    <Modal
      overlayClassName="recipe-viewer-overlay"
      modalClassName="recipe-viewer-modal"
      ariaLabel={t("chefRecommends")}
      onClose={onClose}
    >
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
          {photo && <img className="recipe-viewer-photo" src={photo} alt={dishName || dishNameEn || t("dishPhotoAlt")} />}
          <LazyMarkdown key={recipe} content={recipe} t={t} />
          <div className="recipe-viewer-actions">
            <button className="recipe-action-btn" onClick={() => downloadRecipe(recipe, dishName)}>
              <DownloadIcon />
              {t("downloadRecipe")}
            </button>
            <button className="recipe-action-btn" onClick={handleShare}>
              <ShareIcon />
              {t("shareRecipe")}
            </button>
            {shareFeedback && (
              <p className={shareFeedbackIsError ? "recipe-action-feedback error" : "recipe-action-feedback"}>{shareFeedback}</p>
            )}
            {!isSaved && onSave && (
              <button className="save-recipe-btn" onClick={onSave}>
                {t("saveRecipe")}
              </button>
            )}
          </div>
        </div>
    </Modal>
  )
}

export default memo(RecipeViewer)