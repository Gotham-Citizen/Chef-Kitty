

import { useLanguage } from "../src/LanguageContext"

export default function IngredientsList({ingredients, getRecipe, removeIngredient, loading, sectionRef}) {
  const { t } = useLanguage()
    const IngredientsListItems = ingredients.map((ingredientItem, index) => (
      <li key={`${ingredientItem}-${index}`}>
        {ingredientItem}
        <button 
          className="remove-ingredient-btn"
          aria-label={t("removeAriaLabel", { item: ingredientItem })}
          onClick={() => removeIngredient(index)}
        >
          ✕
        </button>
      </li>
    ))

  return(
    <section>
      <h2>{t("ingredientsOnHand")}</h2>
      <ul className="ingredients-list" aria-live="polite">
        {IngredientsListItems}
      </ul>
      {ingredients.length > 3 ? 
      <div className="get-recipe-container">
        <div ref={sectionRef}>
          <h3>{t("readyForRecipe")}</h3>
          <p>{t("generateRecipe")}</p>
        </div>
        <button 
          disabled={loading}
          onClick={() => {getRecipe(ingredients)}}
        >
          {loading ? t("loading") : t("getRecipe")}
        </button>
      </div>: null}
    </section>
  )
}