import { useState, useRef, useEffect } from "react"
import ClaudeRecipe from "./ClaudeRecipe"
import IngredientsList from "./IngredientsList"
import { getRecipeFromGroq } from "../src/ai"

export default function Main() {
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
      setError("Please enter a valid food ingredient (e.g. oregano, chicken)")
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
      const recipeMarkdown = await getRecipeFromGroq(ingredients)
      if (!recipeMarkdown) throw new Error("No recipe returned")
      setRecipe(recipeMarkdown)
    } catch (err) {
      setError(err.message || "Failed to generate recipe. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  return (
  <main>
    <form className="add-ingredient-form" action={addIngredient}>
      <input 
        type="text"
        placeholder="e.g. oregano"
        aria-label="Add ingredient"
        name="ingredient"
      />
      <button>Add ingredient</button>
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
        <p>Generating recipe...</p>
      </section>
    )}
    {error && (
      <section className="error-container" aria-live="assertive">
        <p className="error-message">{error}</p>
        <button onClick={() => setError("")}>Close</button>
      </section>
    )}
    {recipe ? <ClaudeRecipe recipe={recipe} /> : null}
  </main>
  )
}