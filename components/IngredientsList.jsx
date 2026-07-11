

export default function IngredientsList({ingredients, getRecipe, removeIngredient, loading, sectionRef}) {
    const IngredientsListItems = ingredients.map((ingredientItem, index) => (
      <li key={`${ingredientItem}-${index}`}>
        {ingredientItem}
        <button 
          className="remove-ingredient-btn"
          aria-label={`Remove ${ingredientItem}`}
          onClick={() => removeIngredient(index)}
        >
          ✕
        </button>
      </li>
    ))

  return(
    <section>
      <h2>Ingredients on hand:</h2>
      <ul className="ingredients-list" aria-live="polite">
        {IngredientsListItems}
      </ul>
      {ingredients.length > 3 ? 
      <div className="get-recipe-container">
        <div ref={sectionRef}>
          <h3>Ready for a recipe?</h3>
          <p>Generate a recipe from your list of ingredients. </p>
        </div>
        <button 
          disabled={loading}
          onClick={() => {getRecipe(ingredients)}}
        >
          {loading ? "Loading..." : "Get a recipe"}
        </button>
      </div>: null}
    </section>
  )
}