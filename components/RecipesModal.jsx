import { useState, useMemo, memo } from "react"
import { CloseIcon, TrashIcon, EditIcon } from "./Icons"

function RecipesModal({ recipes, isHistory, savedLimit, onDelete, onViewRecipe, onUpdateTags, onRenameTag, onClose, t }) {
  const title = isHistory ? t("history") : t("savedRecipes")
  const emptyMessage = isHistory ? t("noHistory") : t("noSavedRecipes")
  const dateKey = isHistory ? "searchedOn" : "savedOn"
  const showTags = !isHistory
  const [activeTags, setActiveTags] = useState([])
  const [editingRecipeId, setEditingRecipeId] = useState(null)
  const [editingTag, setEditingTag] = useState(null)
  const [draftTag, setDraftTag] = useState("")
  const [tagRenameDraft, setTagRenameDraft] = useState("")
  const [duplicateTagPrompt, setDuplicateTagPrompt] = useState(null)

  const allTags = useMemo(() => {
    const seen = new Map()
    for (const recipe of recipes) {
      for (const tag of recipe.tags || []) {
        const trimmed = tag.trim()
        const key = trimmed.toLowerCase()
        if (key && !seen.has(key)) seen.set(key, trimmed)
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b))
  }, [recipes])

  const tagFilteredRecipes = useMemo(() => {
    if (activeTags.length === 0) return recipes
    return recipes.filter(recipe =>
      activeTags.every(tag => (recipe.tags || []).some(t => t.trim().toLowerCase() === tag.toLowerCase()))
    )
  }, [recipes, activeTags])

  const isEmptyFiltered = activeTags.length > 0 && tagFilteredRecipes.length === 0

  function toggleTag(tag) {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  function startTagEditing(recipe, tag) {
    setEditingRecipeId(recipe.id)
    setEditingTag(tag ?? null)
    setTagRenameDraft(tag ?? "")
    if (!tag) setDraftTag("")
  }

  function findExistingTag(tag, excludeKey) {
    const key = tag.trim().toLowerCase()
    return recipes
      .flatMap(r => r.tags || [])
      .find(x => {
        const normalized = x.trim().toLowerCase()
        return normalized === key && normalized !== excludeKey
      })
  }

  function commitTag(recipe) {
    const tag = draftTag.trim()
    if (!tag) return
    const existingTag = findExistingTag(tag)
    if (existingTag) {
      setDuplicateTagPrompt({ recipeId: recipe.id, typedTag: tag, existingTag: existingTag })
      setDraftTag("")
      setEditingRecipeId(null)
      return
    }
    onUpdateTags(recipe.id, [...(recipe.tags || []), tag])
    setDraftTag("")
  }

  function commitTagRename(recipe, oldTag) {
    const newTag = tagRenameDraft.trim()
    const oldKey = oldTag.trim().toLowerCase()
    if (!newTag || newTag === oldTag) {
      setEditingTag(null)
      setTagRenameDraft("")
      return
    }
    const existingTag = findExistingTag(newTag, oldKey)
    if (existingTag) {
      setDuplicateTagPrompt({ mode: "rename", recipeId: recipe.id, typedTag: newTag, existingTag: existingTag, oldTag })
      setEditingTag(null)
      setTagRenameDraft("")
      return
    }
    onRenameTag(oldTag, newTag)
    setActiveTags(prev => prev.map(t => t.trim().toLowerCase() === oldKey ? newTag : t))
    setEditingTag(null)
    setTagRenameDraft("")
  }

  function handleKeyDown(e, onCommit) {
    if (e.key === "Enter") {
      e.preventDefault()
      onCommit()
      setEditingRecipeId(null)
    } else if (e.key === "Escape") {
      setEditingRecipeId(null)
      setEditingTag(null)
      setDraftTag("")
      setTagRenameDraft("")
    }
  }

  function handleTagKeyDown(e, recipe) {
    handleKeyDown(e, () => commitTag(recipe))
  }

  function handleRenameKeyDown(e, recipe, tag) {
    handleKeyDown(e, () => commitTagRename(recipe, tag))
  }

  function removeTag(recipe, tag) {
    const key = tag.trim().toLowerCase()
    onUpdateTags(recipe.id, (recipe.tags || []).filter(x => x.trim().toLowerCase() !== key))
    setActiveTags(prev => prev.filter(t => t.toLowerCase() !== key))
  }

  return (
    <>
      <div className="recipes-modal-overlay" onClick={onClose}>
      <div className="recipes-modal" onClick={e => e.stopPropagation()}>
        <div className="recipes-modal-header">
          <div className="recipes-modal-title">
            <h2>{title}</h2>
            {isHistory ? (
              <span className="recipes-modal-subtitle">{t("recentHistoryLabel")}</span>
            ) : (
              <span className="recipes-modal-subtitle">{t("saveLimitSubtitle", { n: savedLimit })}</span>
            )}
          </div>
          <button className="recipes-modal-close" onClick={onClose}>
            <CloseIcon />
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

        {tagFilteredRecipes.length === 0 ? (
          <p className="recipes-modal-empty">{isEmptyFiltered ? t("noMatchingRecipes") : emptyMessage}</p>
        ) : (
          <ul className="recipes-modal-list">
            {tagFilteredRecipes.map(recipe => (
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
                    {showTags && (recipe.tags || []).length === 0 && editingRecipeId !== recipe.id && (
                      <button
                        className="edit-tags-btn"
                        onClick={e => { e.stopPropagation(); startTagEditing(recipe) }}
                        aria-label={t("editTags")}
                      >
                        <EditIcon />
                      </button>
                    )}
                  </div>
                  <div className="recipes-modal-item-date">
                    {t(dateKey, { date: new Date(recipe.savedAt).toLocaleDateString() })}
                  </div>
                  {showTags && ((recipe.tags || []).length > 0 || editingRecipeId === recipe.id) && (
                    <div className="recipes-modal-item-tags" onClick={e => e.stopPropagation()}>
                      {(recipe.tags || []).map(tag => (
                        editingRecipeId === recipe.id && editingTag === tag ? (
                          <input
                            key={tag}
                            className="tag-input"
                            value={tagRenameDraft}
                            onChange={e => setTagRenameDraft(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => handleRenameKeyDown(e, recipe, tag)}
                            onBlur={e => {
                              if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".tag-input")) return
                              commitTagRename(recipe, tag)
                              setEditingRecipeId(null)
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            key={tag}
                            className={editingRecipeId === recipe.id ? "tag-chip" : "tag-chip tag-chip-static"}
                            onMouseDown={editingRecipeId === recipe.id ? e => e.preventDefault() : undefined}
                            onClick={editingRecipeId === recipe.id ? e => { e.preventDefault(); startTagEditing(recipe, tag) } : undefined}
                          >
                            {tag}
                            {editingRecipeId === recipe.id && (
                              <button
                                className="tag-remove"
                                onMouseDown={e => e.preventDefault()}
                                onClick={e => { e.stopPropagation(); removeTag(recipe, tag) }}
                                aria-label={t("removeTag")}
                              >
                                ×
                              </button>
                            )}
                          </span>
                        )
                      ))}
                      {editingRecipeId === recipe.id && (
                        <input
                          className="tag-input"
                          value={draftTag}
                          onChange={e => setDraftTag(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => handleTagKeyDown(e, recipe)}
                          onBlur={e => {
                            if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".recipes-modal-item-tags")) return
                            commitTag(recipe)
                            setEditingRecipeId(null)
                          }}
                          placeholder={t("addTagsPlaceholder")}
                          autoFocus
                        />
                      )}
                      {editingRecipeId !== recipe.id && (
                        <button
                          className="edit-tags-btn"
                          onClick={e => { e.stopPropagation(); startTagEditing(recipe) }}
                          aria-label={t("editTags")}
                        >
                          <EditIcon />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button
                  className="delete-recipe-btn"
                  onClick={e => { e.stopPropagation(); onDelete(recipe) }}
                  aria-label={t("deleteRecipe")}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {duplicateTagPrompt && (
      <div className="duplicate-prompt-overlay" onClick={() => setDuplicateTagPrompt(null)}>
        <div className="duplicate-prompt-modal" onClick={e => e.stopPropagation()}>
          <h3>{t("duplicateTagTitle")}</h3>
          <p>{t("duplicateTagMessage", { typed: duplicateTagPrompt.typedTag, existing: duplicateTagPrompt.existingTag })}</p>
          <div className="duplicate-prompt-actions">
            <button
              className="duplicate-btn-primary"
              onClick={() => {
                if (duplicateTagPrompt.mode === "rename") {
                  onRenameTag(duplicateTagPrompt.oldTag, duplicateTagPrompt.existingTag)
                  const oldKey = duplicateTagPrompt.oldTag.trim().toLowerCase()
                  setActiveTags(prev => prev.map(t => t.trim().toLowerCase() === oldKey ? duplicateTagPrompt.existingTag : t))
                } else {
                  const recipe = recipes.find(r => r.id === duplicateTagPrompt.recipeId)
                  onUpdateTags(recipe.id, [...(recipe.tags || []), duplicateTagPrompt.existingTag])
                }
                setDuplicateTagPrompt(null)
              }}
            >
              {t("duplicateTagSaveUnder", { existing: duplicateTagPrompt.existingTag })}
            </button>
            <button className="duplicate-btn-secondary" onClick={() => setDuplicateTagPrompt(null)}>
              {t("duplicateTagCancel")}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default memo(RecipesModal)