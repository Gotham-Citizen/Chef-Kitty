import { useState, useRef, useEffect } from "react"
import ClaudeRecipe from "./ClaudeRecipe"
import IngredientsList from "./IngredientsList"
import { getRecipeFromGroq } from "../src/ai"
import { useLanguage } from "../src/LanguageContext"

export default function Main() {
  const { t, language } = useLanguage()
  const [recipe, setRecipe] = useState("") 
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const recipeSection = useRef(null)

  function isValidIngredient(str) {
    const trimmed = str.trim()
    if (trimmed.length < 2) return false
    if (!/\p{L}/u.test(trimmed)) return false
    if (/^\d+$/.test(trimmed)) return false
    return true
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient")
    if (!isValidIngredient(newIngredient)) {
      setError(t("errorInvalidIngredient"))
      return
    }
    setIngredients(prevIngredients => [...prevIngredients, newIngredient.trim()])
  }

  function removeIngredient(index) {
    setIngredients(prevIngredients => prevIngredients.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (recipeSection.current && recipe)
      recipeSection.current.scrollIntoView({behavior: "smooth"})
  }, [recipe])

  async function getRecipe(ingredients) {
    setLoading(true)
    setError("")
    try {
      const recipeMarkdown = await getRecipeFromGroq(ingredients, language)
      if (!recipeMarkdown) throw new Error(t("errorNoRecipe"))
      setRecipe(recipeMarkdown)
    } catch (err) {
      setError(err.message || t("errorNoRecipe"))
    } finally {
      setLoading(false)
    }
  }

  return (
  <main>
    <form className="add-ingredient-form" action={addIngredient}>
      <input 
        type="text"
        placeholder={t("ingredientPlaceholder")}
        aria-label={t("addIngredient")}
        name="ingredient"
      />
      <button>{t("addIngredient")}</button>
    </form>
    {ingredients.length ? 
    <IngredientsList 
      sectionRef={recipeSection} 
      ingredients={ingredients} 
      getRecipe={getRecipe} 
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
    {recipe ? <ClaudeRecipe recipe={recipe} /> : null}
  </main>
  )
}