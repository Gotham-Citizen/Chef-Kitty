import { useState, useMemo, memo } from "react"

function RecipesModal({ recipes, title, emptyMessage, dateKey, showHistorySubtitle, showTags, onDelete, onViewRecipe, onUpdateTags, onClose, t }) {
  const [activeTags, setActiveTags] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [draftTag, setDraftTag] = useState("")

  const allTags = useMemo(() => {
    const seen = new Set()
    for (const recipe of recipes) {
      for (const tag of recipe.tags || []) {
        const key = tag.trim().toLowerCase()
        if (key) seen.add(key)
      }
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b))
  }, [recipes])

  const items = activeTags.length === 0
    ? recipes
    : recipes.filter(recipe =>
        activeTags.every(tag => (recipe.tags || []).some(t => t.trim().toLowerCase() === tag))
      )

  const isEmptyFiltered = activeTags.length > 0 && items.length === 0

  function toggleTag(tag) {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function startEdit(recipe) {
    setEditingId(recipe.id)
    setDraftTag("")
  }

  function commitTag(recipe) {
    const tag = draftTag.trim().toLowerCase()
    if (!tag) return
    const current = (recipe.tags || []).map(x => x.trim().toLowerCase())
    if (!current.includes(tag)) {
      onUpdateTags(recipe.id, [...(recipe.tags || []), tag])
    }
    setDraftTag("")
  }

  function handleTagKeyDown(e, recipe) {
    if (e.key === "Enter") {
      e.preventDefault()
      commitTag(recipe)
      setEditingId(null)
    } else if (e.key === "Escape") {
      setEditingId(null)
      setDraftTag("")
    }
  }

  function removeTag(recipe, tag) {
    const key = tag.trim().toLowerCase()
    onUpdateTags(recipe.id, (recipe.tags || []).filter(x => x.trim().toLowerCase() !== key))
    setActiveTags(prev => prev.filter(t => t !== key))
  }

  return (
    <div className="recipes-modal-overlay" onClick={onClose}>
      <div className="recipes-modal" onClick={e => e.stopPropagation()}>
        <div className="recipes-modal-header">
          <div className="recipes-modal-title">
            <h2>{title}</h2>
            {showHistorySubtitle && (
              <span className="recipes-modal-subtitle">{t("recentHistoryLabel")}</span>
            )}
          </div>
          <button className="recipes-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {showTags && allTags.length > 0 && (
          <div className="recipes-modal-filter">
            <div className="recipes-modal-filter-chips">
              <button
                className={activeTags.length === 0 ? "tag-chip active" : "tag-chip"}
                onClick={() => setActiveTags([])}
              >
                {t("allTags")}
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={activeTags.includes(tag) ? "tag-chip active" : "tag-chip"}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p className="recipes-modal-empty">{isEmptyFiltered ? t("noMatchingRecipes") : emptyMessage}</p>
        ) : (
          <ul className="recipes-modal-list">
            {items.map(recipe => (
              <li
                key={recipe.id}
                className="recipes-modal-item"
                onClick={() => onViewRecipe(recipe)}
              >
                <div className="recipes-modal-item-content">
                  <div className="recipes-modal-item-ingredients-row">
                    <div className="recipes-modal-item-ingredients">
                      {recipe.ingredients.slice(0, 4).join(", ")}
                      {recipe.ingredients.length > 4 ? "..." : ""}
                    </div>
                    {showTags && (editingId === recipe.id ? (
                      <input
                        className="tag-input"
                        value={draftTag}
                        onChange={e => setDraftTag(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => handleTagKeyDown(e, recipe)}
                        onBlur={() => { commitTag(recipe); setEditingId(null) }}
                        placeholder={t("addTagsPlaceholder")}
                        autoFocus
                      />
                    ) : (
                      <button
                        className="edit-tags-btn"
                        onClick={e => { e.stopPropagation(); startEdit(recipe) }}
                        aria-label={t("editTags")}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <div className="recipes-modal-item-date">
                    {t(dateKey, { date: new Date(recipe.savedAt).toLocaleDateString() })}
                  </div>
                  {showTags && (recipe.tags || []).length > 0 && (
                    <div className="recipes-modal-item-tags" onClick={e => e.stopPropagation()}>
                      {(recipe.tags || []).map(tag => (
                        <span key={tag} className="tag-chip tag-chip-static">
                          {tag}
                          {editingId === recipe.id && (
                            <button
                              className="tag-remove"
                              onClick={() => removeTag(recipe, tag)}
                              aria-label={t("removeTag")}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="delete-recipe-btn"
                  onClick={e => { e.stopPropagation(); onDelete(recipe) }}
                  aria-label={t("deleteRecipe")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default memo(RecipesModal)
