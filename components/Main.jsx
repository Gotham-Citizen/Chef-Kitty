import { useState, useRef, useEffect, useCallback } from "react"
import KittyRecipe from "./KittyRecipe"
import IngredientsList from "./IngredientsList"
import RecipesModal from "./RecipesModal"
import SavedLimitModal from "./SavedLimitModal"
import RecipeViewer from "./RecipeViewer"
import CelebrationEffect from "./CelebrationEffect"
import Modal from "./Modal"
import { RefreshIcon, DownloadIcon, ShareIcon } from "./Icons"
import { getRecipeFromGroq } from "../src/ai"
import { getDishImage } from "../src/utils/dishImage"
import { downloadRecipe, shareRecipe, extractTitle } from "../src/utils/recipeShare"
import { useTranslation } from 'react-i18next';
import INGREDIENTS from "../src/ingredients"
import useLocalStorage from "../src/utils/useLocalStorage"
import { detectInputLanguage } from "../src/utils/i18n"
import { similarity, isSimilarEnough } from "../src/utils/levenshtein"
import { getPinyin, getPinyinInitials, loadPinyin } from "../src/utils/pinyin"

const SAVED_LIMIT = 50

function normalizeIngredients(ingredients) {
  return (ingredients || []).map(i => i.trim().toLowerCase()).sort()
}

export default function Main({ isRecipesModalOpen, onCloseRecipesModal, isHistory }) {
  const { t, i18n } = useTranslation();
  const [recipe, setRecipe] = useState("")
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const ingredientsSection = useRef(null)
  const recipeSection = useRef(null)
  const blurTimeout = useRef(null)

  const [history, setHistory] = useLocalStorage("chef-kitty-history", [])
  const [savedRecipes, setSavedRecipes] = useLocalStorage("chef-kitty-saved", [])

  const [recipeMeta, setRecipeMeta] = useState(null)
  const [viewingRecipe, setViewingRecipe] = useState(null)
  const [pendingSave, setPendingSave] = useState(null)
  const [duplicateIngredientPrompt, setDuplicateIngredientPrompt] = useState(null)
  const [pendingIngredients, setPendingIngredients] = useState(null)
  const [duplicateRecipePrompt, setDuplicateRecipePrompt] = useState(null)
  const [photoUrl, setPhotoUrl] = useState("")
  const [generatedDishNames, setGeneratedDishNames] = useState([])
  const [shareFeedback, setShareFeedback] = useState("")
  const [shareFeedbackIsError, setShareFeedbackIsError] = useState(false)
  const shareFeedbackTimer = useRef(null)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const celebrationTimer = useRef(null)

  const recipeRequestRef = useRef(0)

  function makeHistoryEntryWithoutPhoto(recipe, ingredients, language, dishName, dishNameEn) {
    return { id: Date.now(), recipe, ingredients, language, dishName, dishNameEn, photo: null, savedAt: new Date().toISOString() }
  }

  function saveToHistory(entry) {
    setHistory(prev => [entry, ...prev].slice(0, 5))
  }

  function updateHistoryPhoto(id, photo) {
    setHistory(prev => prev.map(r => (r.id === id ? { ...r, photo } : r)))
  }

  const storeSavedRecipe = useCallback((recipe, ingredients, language, dishName, dishNameEn, photo) => {
    setSavedRecipes(prev => {
      if (prev.some(r => r.recipe === recipe)) return prev
      const entry = { id: Date.now(), recipe, ingredients, language, tags: [], dishName, dishNameEn, photo, savedAt: new Date().toISOString() }
      return [entry, ...prev].slice(0, SAVED_LIMIT)
    })
    setCelebrationKey(k => k + 1)
    setShowCelebration(true)
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
    celebrationTimer.current = setTimeout(() => setShowCelebration(false), 4500)
  }, [setSavedRecipes])

  const saveToSaved = useCallback((recipe, ingredients, language, dishName, dishNameEn, photo) => {
    if (savedRecipes.length >= SAVED_LIMIT) {
      setPendingSave({ recipe, ingredients, language, dishName, dishNameEn, photo })
      return
    }
    storeSavedRecipe(recipe, ingredients, language, dishName, dishNameEn, photo)
  }, [savedRecipes, storeSavedRecipe])

  const handleReplaceForPendingSave = useCallback((id) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id))
    if (pendingSave) {
      storeSavedRecipe(pendingSave.recipe, pendingSave.ingredients, pendingSave.language, pendingSave.dishName, pendingSave.dishNameEn, pendingSave.photo)
    }
    setPendingSave(null)
  }, [pendingSave, storeSavedRecipe, setSavedRecipes])

  const deleteSavedRecipe = useCallback((id) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id))
  }, [setSavedRecipes])

  const deleteHistoryItem = useCallback((id) => {
    setHistory(prev => prev.filter(r => r.id !== id))
  }, [setHistory])

  const updateSavedTags = useCallback((id, tags) => {
    setSavedRecipes(prev => prev.map(r => (r.id === id ? { ...r, tags } : r)))
  }, [setSavedRecipes])

  const renameSavedTag = useCallback((oldTag, newTag) => {
    const oldKey = oldTag.trim().toLowerCase()
    setSavedRecipes(prev => prev.map(r => ({
      ...r,
      tags: (r.tags || []).map(x => x.trim().toLowerCase() === oldKey ? newTag : x),
    })))
  }, [setSavedRecipes])
  
  const viewRecipeFromList = useCallback((entry) => {
    setViewingRecipe({ recipe: entry.recipe, ingredients: entry.ingredients, language: entry.language, dishName: entry.dishName, dishNameEn: entry.dishNameEn, photo: entry.photo, fromSaved: !isHistory })
  }, [isHistory])

  function isValidIngredient(str) {
    const trimmed = str.trim()
    if (trimmed.length === 0) return false
    if (!/\p{L}/u.test(trimmed)) return false
    if (/^\d+$/.test(trimmed)) return false
    if (trimmed.length < 2 && !/^\p{Script=Han}$/u.test(trimmed)) return false
    return true
  }

  function isSimilarIngredient(newIngredient, existingIngredients) {
    const normalized = newIngredient.trim().toLowerCase()
    for (const existing of existingIngredients) {
      const existingNorm = existing.trim().toLowerCase()
      if (normalized === existingNorm) return true

      const shorter = normalized.length <= existingNorm.length ? normalized : existingNorm
      const longer = normalized.length <= existingNorm.length ? existingNorm : normalized
      const escaped = shorter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`\\b${escaped}\\b`)
      if (pattern.test(longer)) return true

      if (isSimilarEnough(normalized, existingNorm, 0.8)) return true
    }
    return false
  }

  function addIngredient(ingredient) {
    if (!isValidIngredient(ingredient)) {
      setError(t("errorInvalidIngredient"))
      return
    }
    if (isSimilarIngredient(ingredient, ingredients)) {
      setError(t("errorDuplicateIngredient"))
      return
    }
    setIngredients(prevIngredients => [...prevIngredients, ingredient.trim()])
  }

  const filterSuggestions = useCallback((value) => {
    if (value.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightIndex(-1)
      return
    }
    const uiLang = (i18n.language || "en").toLowerCase().split("-")[0]
    const inputLang = uiLang === "zh" ? "zh" : uiLang === "es" ? "es" : "en"
    const isZh = inputLang === "zh"
    const items = INGREDIENTS[inputLang] || INGREDIENTS.en
    const lowerValue = value.toLowerCase()

    const matchesText = (item) => {
      if (item.toLowerCase().includes(lowerValue)) return true
      if (isZh && (getPinyin(item).includes(lowerValue) || getPinyinInitials(item).includes(lowerValue))) {
        return true
      }
      return false
    }
    const matched = items.filter(matchesText)

    let final
    if (matched.length === 0) {
      final = items
        .map(item => {
          let score = similarity(item.toLowerCase(), lowerValue)
          if (isZh) {
            score = Math.max(score, similarity(getPinyin(item), lowerValue))
          }
          return { item, score }
        })
        .filter(({ score }) => score >= 0.6)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(({ item }) => item)
    } else {
      const hasExact = matched.some(item =>
        item.toLowerCase() === lowerValue || (isZh && getPinyin(item) === lowerValue)
      )
      const deduped = hasExact
        ? matched.filter(item => {
            if (item.toLowerCase() === lowerValue || (isZh && getPinyin(item) === lowerValue)) return true
            const words = item.toLowerCase().split(/\s+/)
            return words[words.length - 1] !== lowerValue
          })
        : matched

      final = deduped.slice(0, 10)
    }
    setSuggestions(final)
    setShowSuggestions(final.length > 0)
    setHighlightIndex(-1)
  }, [i18n])

  useEffect(() => {
    if (!(i18n.language || "").toLowerCase().startsWith("zh")) return
    loadPinyin().then(() => {
      setInputValue(prev => {
        if (prev.trim()) filterSuggestions(prev)
        return prev
      })
    })
  }, [i18n.language, filterSuggestions])

  function handleSubmit(e) {
    e.preventDefault()
    if (highlightIndex >= 0 && suggestions[highlightIndex]) {
      addIngredient(suggestions[highlightIndex])
      setInputValue("")
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightIndex(-1)
      return
    }
    addIngredient(inputValue)
    setInputValue("")
    setSuggestions([])
    setShowSuggestions(false)
    setHighlightIndex(-1)
  }

  function handleInputChange(e) {
    const value = e.target.value
    setInputValue(value)
    filterSuggestions(value)
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      )
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setSuggestions([])
      setHighlightIndex(-1)
    }
  }

  function selectSuggestion(item) {
    addIngredient(item)
    setInputValue("")
    setSuggestions([])
    setShowSuggestions(false)
    setHighlightIndex(-1)
  }

  function handleInputFocus() {
    if (inputValue.trim().length > 0) {
      filterSuggestions(inputValue)
    }
  }

  function handleInputBlur() {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current)
    }
    blurTimeout.current = setTimeout(() => {
      setShowSuggestions(false)
      setSuggestions([])
      setHighlightIndex(-1)
    }, 150)
  }

  function removeIngredient(index) {
    setIngredients(prevIngredients => prevIngredients.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (recipeSection.current && recipe)
      recipeSection.current.scrollIntoView({behavior: "smooth", block: "start"})
  }, [recipe])

  useEffect(() => {
    if (!recipe) return
    const currentIngredients = normalizeIngredients(ingredients)
    const generatedIngredients = normalizeIngredients(recipeMeta?.ingredients)
    if (JSON.stringify(currentIngredients) !== JSON.stringify(generatedIngredients)) {
      setRecipe("")
      setRecipeMeta(null)
      setPhotoUrl("")
      setGeneratedDishNames([])
    }
  }, [ingredients, recipe, recipeMeta])

  function handleGetRecipe(ingredients) {
    const normalized = normalizeIngredients(ingredients)

    const savedMatch = savedRecipes.find(r => {
      const rNorm = normalizeIngredients(r.ingredients)
      return JSON.stringify(normalized) === JSON.stringify(rNorm)
    })
    if (savedMatch) {
      setDuplicateIngredientPrompt({ ...savedMatch, source: "saved" })
      setPendingIngredients(ingredients)
      return
    }

    const historyMatch = history.find(r => {
      const rNorm = normalizeIngredients(r.ingredients)
      return JSON.stringify(normalized) === JSON.stringify(rNorm)
    })
    if (historyMatch) {
      setDuplicateIngredientPrompt({ ...historyMatch, source: "history" })
      setPendingIngredients(ingredients)
      return
    }

    getRecipe(ingredients)
  }

  function handleDuplicateIngredientChoice(viewSaved) {
    const { recipe, language, ingredients, dishName, dishNameEn, photo } = duplicateIngredientPrompt || {}
    if (viewSaved && duplicateIngredientPrompt) {
      setViewingRecipe({ recipe, ingredients, language, dishName, dishNameEn, photo })
    } else if (pendingIngredients) {
      getRecipe(pendingIngredients, dishName ? [dishName] : [])
    }
    setDuplicateIngredientPrompt(null)
    setPendingIngredients(null)
  }

  function handleViewDuplicateRecipe() {
    const { recipeMarkdown, ingredients, language, dishName, dishNameEn } = duplicateRecipePrompt
    const entry = makeHistoryEntryWithoutPhoto(recipeMarkdown, ingredients, language, dishName, dishNameEn)
    saveToHistory(entry)
    setGeneratedDishNames(prev => [...prev, dishName].filter(Boolean).slice(-10))
    setViewingRecipe({ recipe: recipeMarkdown, photo: "", ingredients, language, dishName, dishNameEn })
    setDuplicateRecipePrompt(null)
    getDishImage(dishName, dishNameEn)
      .catch(() => null)
      .then(photo => {
        updateHistoryPhoto(entry.id, photo)
        setViewingRecipe(prev =>
          prev && prev.recipe === recipeMarkdown ? { ...prev, photo } : prev
        )
      })
  }

  async function getRecipe(ingredients, existingDishes = []) {
    setRecipe("")
    setRecipeMeta(null)
    setPhotoUrl("")
    setLoading(true)
    setError("")
    try {
      const recipeLanguage = detectInputLanguage(ingredients, i18n.language)
      let recipeData = await getRecipeFromGroq(ingredients, recipeLanguage, existingDishes)
      let recipeMarkdown = recipeData.recipe
      let dishName = recipeData.dishName || extractTitle(recipeMarkdown) || ""
      let dishNameEn = recipeData.dishNameEn || ""
      if (!recipeMarkdown) throw new Error(t("errorNoRecipe"))
      if (existingDishes.length > 0) {
        let retries = 0
        const retryDelays = [800, 1600]
        const isDuplicateRecipe = () =>
          dishName && existingDishes.some(name => name.trim().toLowerCase() === dishName.trim().toLowerCase())
        while (isDuplicateRecipe() && retries < 2) {
          await new Promise(resolve => setTimeout(resolve, retryDelays[retries] ?? 1600))
          recipeData = await getRecipeFromGroq(ingredients, recipeLanguage, existingDishes)
          recipeMarkdown = recipeData.recipe
          dishName = recipeData.dishName || extractTitle(recipeMarkdown) || ""
          dishNameEn = recipeData.dishNameEn || ""
          retries++
        }
        if (isDuplicateRecipe()) {
          setLoading(false)
          setDuplicateRecipePrompt({ recipeMarkdown, ingredients, language: recipeLanguage, dishName, dishNameEn })
          return
        }
      }
      const requestId = ++recipeRequestRef.current
      setRecipe(recipeMarkdown)
      setRecipeMeta({ ingredients: [...ingredients], language: recipeLanguage, dishName, dishNameEn })
      setGeneratedDishNames([...existingDishes, dishName].filter(Boolean).slice(-10))
      const entry = makeHistoryEntryWithoutPhoto(recipeMarkdown, ingredients, recipeLanguage, dishName, dishNameEn)
      saveToHistory(entry)
      getDishImage(dishName, dishNameEn)
        .catch(() => null)
        .then(photo => {
          if (recipeRequestRef.current !== requestId) return
          setPhotoUrl(photo)
          updateHistoryPhoto(entry.id, photo)
        })
    } catch (err) {
      const isRateLimited = Boolean(err?.cause?.isRateLimited)
      setError(isRateLimited ? t("errorBusy") : (err.message || t("errorNoRecipe")))
    } finally {
      setLoading(false)
    }
  }

  const isDuplicateIngredientFromHistory = duplicateIngredientPrompt?.source === "history"
  const viewingRecipeFromHistory = !viewingRecipe?.fromSaved

  const handleDeleteRecipe = useCallback((recipe) => {
    if (isHistory) {
      deleteHistoryItem(recipe.id)
    } else {
      deleteSavedRecipe(recipe.id)
    }
  }, [isHistory, deleteHistoryItem, deleteSavedRecipe])

  const closeRecipeViewer = useCallback(() => setViewingRecipe(null), [])

  const handleSaveViewingRecipe = useCallback(() => {
    if (!viewingRecipe) return
    saveToSaved(viewingRecipe.recipe, viewingRecipe.ingredients, viewingRecipe.language, viewingRecipe.dishName, viewingRecipe.dishNameEn, viewingRecipe.photo)
  }, [viewingRecipe, saveToSaved])

  const showShareFeedback = useCallback((message, isError = false) => {
    setShareFeedback(message)
    setShareFeedbackIsError(isError)
    if (shareFeedbackTimer.current) clearTimeout(shareFeedbackTimer.current)
    shareFeedbackTimer.current = setTimeout(() => setShareFeedback(""), 3000)
  }, [])

  async function handleShareRecipe() {
    const title = recipeMeta?.dishName || extractTitle(recipe) || ""
    const result = await shareRecipe(recipe, title)
    if (result === "copied") showShareFeedback(t("copiedToClipboard"))
    else if (!result) showShareFeedback(t("copyFailed"), true)
  }

  const viewerOnSave = viewingRecipe && viewingRecipeFromHistory ? handleSaveViewingRecipe : null

  return (
  <main>
    <form className="add-ingredient-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="input-wrapper">
        <input
          type="text"
          placeholder={t("ingredientPlaceholder")}
          aria-label={t("addIngredient")}
          name="ingredient"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoComplete="off"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className={index === highlightIndex ? "highlighted" : ""}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectSuggestion(item)
                }}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit">{t("addIngredient")}</button>
    </form>
    {ingredients.length ?
    <IngredientsList
      sectionRef={ingredientsSection}
      ingredients={ingredients}
      getRecipe={handleGetRecipe}
      removeIngredient={removeIngredient}
      loading={loading}
      hasRecipe={Boolean(recipe)}
    /> : null}
    {loading && (
      <section className="loading-container" aria-live="polite">
        <p>{t("generatingRecipe")}</p>
      </section>
    )}
    {error && (
      <section className="error-container" aria-live="assertive">
        <p className="error-message">{error}</p>
        <button onClick={() => setError("")}>{t("errorClose")}</button>
      </section>
    )}
    {recipe ? (
      <div className="recipe-section">
        <KittyRecipe recipe={recipe} photo={photoUrl} dishName={recipeMeta?.dishName} dishNameEn={recipeMeta?.dishNameEn} sectionRef={recipeSection} />
        <div className="recipe-actions">
          <button className="recipe-action-btn" onClick={() => getRecipe(recipeMeta.ingredients, generatedDishNames)} disabled={loading}>
            <RefreshIcon />
            {t("regenerate")}
          </button>
          <button className="recipe-action-btn" onClick={() => downloadRecipe(recipe, recipeMeta?.dishName)}>
            <DownloadIcon />
            {t("downloadRecipe")}
          </button>
          <button className="recipe-action-btn" onClick={handleShareRecipe}>
            <ShareIcon />
            {t("shareRecipe")}
          </button>
          {shareFeedback && (
            <p className={shareFeedbackIsError ? "recipe-action-feedback error" : "recipe-action-feedback"}>{shareFeedback}</p>
          )}
          {!savedRecipes.some(r => r.recipe === recipe) && recipeMeta && (
            <button
              className="save-recipe-btn"
              onClick={() => saveToSaved(recipe, recipeMeta.ingredients, recipeMeta.language, recipeMeta.dishName, recipeMeta.dishNameEn, photoUrl)}
            >
              {t("saveRecipe")}
            </button>
          )}
        </div>
      </div>
    ) : null}

    {duplicateIngredientPrompt && (
      <Modal
        overlayClassName="duplicate-prompt-overlay"
        modalClassName="duplicate-prompt-modal"
        ariaLabel={t("duplicateIngredientTitle")}
        onClose={() => { setDuplicateIngredientPrompt(null); setPendingIngredients(null) }}
      >
        <h3>{t("duplicateIngredientTitle")}</h3>
        <p>{isDuplicateIngredientFromHistory ? t("duplicateIngredientHistoryMessage") : t("duplicateIngredientSavedMessage")}</p>
        <div className="duplicate-prompt-actions">
          <button className="duplicate-btn-primary" onClick={() => handleDuplicateIngredientChoice(true)}>
            {isDuplicateIngredientFromHistory ? t("duplicateIngredientViewHistory") : t("duplicateIngredientViewSaved")}
          </button>
          <button className="duplicate-btn-secondary" onClick={() => handleDuplicateIngredientChoice(false)}>
            {t("duplicateIngredientGenerateNew")}
          </button>
        </div>
      </Modal>
    )}

    {duplicateRecipePrompt && (
      <Modal
        overlayClassName="duplicate-prompt-overlay"
        modalClassName="duplicate-prompt-modal"
        ariaLabel={t("duplicateRecipeTitle")}
        onClose={() => setDuplicateRecipePrompt(null)}
      >
        <h3>{t("duplicateRecipeTitle")}</h3>
        <p>{t("duplicateRecipeMessage")}</p>
        <div className="duplicate-prompt-actions">
          <button className="duplicate-btn-primary" onClick={handleViewDuplicateRecipe}>
            {t("duplicateRecipeView")}
          </button>
          <button className="duplicate-btn-secondary" onClick={() => setDuplicateRecipePrompt(null)}>
            {t("duplicateRecipeCancel")}
          </button>
        </div>
      </Modal>
    )}

    {isRecipesModalOpen && (
      <RecipesModal
        isHistory={isHistory}
        recipes={isHistory ? history : savedRecipes}
        savedLimit={SAVED_LIMIT}
        onDelete={handleDeleteRecipe}
        onViewRecipe={viewRecipeFromList}
        onUpdateTags={updateSavedTags}
        onRenameTag={renameSavedTag}
        onClose={onCloseRecipesModal}
        t={t}
      />
    )}

    {pendingSave && (
      <SavedLimitModal
        recipes={savedRecipes}
        limit={SAVED_LIMIT}
        onDelete={handleReplaceForPendingSave}
        onCancel={() => setPendingSave(null)}
        t={t}
      />
    )}

    <RecipeViewer
      recipe={viewingRecipe?.recipe}
      photo={viewingRecipe?.photo}
      dishName={viewingRecipe?.dishName}
      dishNameEn={viewingRecipe?.dishNameEn}
      isSaved={viewingRecipe ? viewingRecipeFromHistory && savedRecipes.some(r => r.recipe === viewingRecipe.recipe) : false}
      onSave={viewerOnSave}
      onClose={closeRecipeViewer}
      t={t}
    />

    {showCelebration && <CelebrationEffect key={celebrationKey} />}
  </main>
  )
}