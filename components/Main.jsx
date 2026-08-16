mport { useState, useRef, useEffect, useCallback } from "react"
import KittyRecipe from "./KittyRecipe"
import IngredientsList from "./IngredientsList"
import RecipesModal from "./RecipesModal"
import SavedLimitModal from "./SavedLimitModal"
import RecipeViewer from "./RecipeViewer"
import CelebrationEffect from "./CelebrationEffect"
import { getRecipeFromGroq } from "../src/ai"
import { useTranslation } from 'react-i18next';
import INGREDIENTS from "../src/ingredients"
import useLocalStorage from "../src/utils/useLocalStorage"
import { detectInputLanguage } from "../src/utils/i18n"
import { similarity, isSimilarEnough } from "../src/utils/levenshtein"
import { getPinyin, getPinyinInitials } from "../src/utils/pinyin"

const SAVED_LIMIT = 50

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
  const blurTimeout = useRef(null)

  const [history, setHistory] = useLocalStorage("chef-kitty-history", [])
  const [savedRecipes, setSavedRecipes] = useLocalStorage("chef-kitty-saved", [])

  const [recipeMeta, setRecipeMeta] = useState(null)
  const [viewingRecipe, setViewingRecipe] = useState(null)
  const [pendingSave, setPendingSave] = useState(null)
  const [duplicatePrompt, setDuplicatePrompt] = useState(null)
  const [pendingIngredients, setPendingIngredients] = useState(null)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const celebrationTimer = useRef(null)

  function saveToHistory(recipe, ingredients, language) {
    setHistory(prev => {
      const entry = { id: Date.now(), recipe, ingredients, language, savedAt: new Date().toISOString() }
      return [entry, ...prev].slice(0, 5)
    })
  }

  const storeSavedRecipe = useCallback((recipe, ingredients, language) => {
    setSavedRecipes(prev => {
      if (prev.some(r => r.recipe === recipe)) return prev
      const entry = { id: Date.now(), recipe, ingredients, language, tags: [], savedAt: new Date().toISOString() }
      return [entry, ...prev].slice(0, SAVED_LIMIT)
    })
    setCelebrationKey(k => k + 1)
    setShowCelebration(true)
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
    celebrationTimer.current = setTimeout(() => setShowCelebration(false), 4500)
  }, [setSavedRecipes])

  const saveToSaved = useCallback((recipe, ingredients, language) => {
    if (savedRecipes.length >= SAVED_LIMIT) {
      setPendingSave({ recipe, ingredients, language })
      return
    }
    storeSavedRecipe(recipe, ingredients, language)
  }, [savedRecipes, storeSavedRecipe])

  const handleReplaceForPendingSave = useCallback((id) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id))
    if (pendingSave) {
      storeSavedRecipe(pendingSave.recipe, pendingSave.ingredients, pendingSave.language)
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
    setViewingRecipe({ recipe: entry.recipe, ingredients: entry.ingredients, language: entry.language, fromSaved: !isHistory })
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
    if (ingredientsSection.current && recipe)
      ingredientsSection.current.scrollIntoView({behavior: "smooth"})
  }, [recipe])

  function handleGetRecipe(ingredients) {
    const normalized = ingredients.map(i => i.trim().toLowerCase()).sort()

    const savedMatch = savedRecipes.find(r => {
      const rNorm = r.ingredients.map(i => i.trim().toLowerCase()).sort()
      return JSON.stringify(normalized) === JSON.stringify(rNorm)
    })
    if (savedMatch) {
      setDuplicatePrompt({ ...savedMatch, source: "saved" })
      setPendingIngredients(ingredients)
      return
    }

    const historyMatch = history.find(r => {
      const rNorm = r.ingredients.map(i => i.trim().toLowerCase()).sort()
      return JSON.stringify(normalized) === JSON.stringify(rNorm)
    })
    if (historyMatch) {
      setDuplicatePrompt({ ...historyMatch, source: "history" })
      setPendingIngredients(ingredients)
      return
    }

    getRecipe(ingredients)
  }

  function handleDuplicateChoice(viewSaved) {
    const { recipe, language, ingredients } = duplicatePrompt || {}
    if (viewSaved && duplicatePrompt) {
      setViewingRecipe({ recipe, ingredients, language })
    } else if (pendingIngredients) {
      getRecipe(pendingIngredients, recipe)
    }
    setDuplicatePrompt(null)
    setPendingIngredients(null)
  }

  async function getRecipe(ingredients, existingRecipe) {
    setRecipe("")
    setRecipeMeta(null)
    setLoading(true)
    setError("")
    try {
      const recipeLanguage = detectInputLanguage(ingredients, i18n.language)
      let recipeMarkdown = await getRecipeFromGroq(ingredients, recipeLanguage, existingRecipe)
      if (!recipeMarkdown) throw new Error(t("errorNoRecipe"))
      if (existingRecipe) {
        let retries = 0
        const retryDelays = [800, 1600]
        while (recipeMarkdown === existingRecipe && retries < 2) {
          await new Promise(resolve => setTimeout(resolve, retryDelays[retries] ?? 1600))
          recipeMarkdown = await getRecipeFromGroq(ingredients, recipeLanguage, existingRecipe)
          retries++
        }
      }
      setRecipe(recipeMarkdown)
      setRecipeMeta({ ingredients: [...ingredients], language: recipeLanguage })
      saveToHistory(recipeMarkdown, ingredients, recipeLanguage)
    } catch (err) {
      const isRateLimited = Boolean(err?.cause?.isRateLimited)
      setError(isRateLimited ? t("errorBusy") : (err.message || t("errorNoRecipe")))
    } finally {
      setLoading(false)
    }
  }

  const isDuplicateFromHistory = duplicatePrompt?.source === "history"
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
    saveToSaved(viewingRecipe.recipe, viewingRecipe.ingredients, viewingRecipe.language)
  }, [viewingRecipe, saveToSaved])

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
        <KittyRecipe recipe={recipe} />
        {!savedRecipes.some(r => r.recipe === recipe) && recipeMeta && (
          <button
            className="save-recipe-btn"
            onClick={() => saveToSaved(recipe, recipeMeta.ingredients, recipeMeta.language)}
          >
            {t("saveRecipe")}
          </button>
        )}
      </div>
    ) : null}

    {duplicatePrompt && (
      <div className="duplicate-prompt-overlay" onClick={() => { setDuplicatePrompt(null); setPendingIngredients(null) }}>
        <div className="duplicate-prompt-modal" onClick={e => e.stopPropagation()}>
          <h3>{t("duplicateTitle")}</h3>
          <p>{isDuplicateFromHistory ? t("duplicateHistoryMessage") : t("duplicateSavedMessage")}</p>
          <div className="duplicate-prompt-actions">
            <button className="duplicate-btn-primary" onClick={() => handleDuplicateChoice(true)}>
              {isDuplicateFromHistory ? t("duplicateViewHistory") : t("duplicateViewSaved")}
            </button>
            <button className="duplicate-btn-secondary" onClick={() => handleDuplicateChoice(false)}>
              {t("duplicateGenerateNew")}
            </button>
          </div>
        </div>
      </div>
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
      isSaved={viewingRecipe ? viewingRecipeFromHistory && savedRecipes.some(r => r.recipe === viewingRecipe.recipe) : false}
      onSave={viewerOnSave}
      onClose={closeRecipeViewer}
      t={t}
    />

    {showCelebration && <CelebrationEffect key={celebrationKey} />}
  </main>
  )
}