import { useState } from "react"
import { TrashIcon } from "./Icons"
import Modal from "./Modal"

function SavedLimitModal({ recipes, limit, onDelete, onCancel, t }) {
  const [step, setStep] = useState("warning")
  const ariaLabel = step === "warning" ? t("saveLimitTitle") : t("saveLimitPickTitle")

  return (
    <Modal
      overlayClassName="saved-limit-overlay"
      modalClassName="saved-limit-modal"
      ariaLabel={ariaLabel}
      onClose={onCancel}
    >
        {step === "warning" ? (
          <>
            <h3>{t("saveLimitTitle")}</h3>
            <p>{t("saveLimitMessage", { n: limit })}</p>
            <div className="saved-limit-actions">
              <button className="duplicate-btn-primary" onClick={() => setStep("pick")}>
                {t("saveLimitDeleteAction")}
              </button>
              <button className="duplicate-btn-secondary" onClick={onCancel}>
                {t("saveLimitGiveUp")}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>{t("saveLimitPickTitle")}</h3>
            <p>{t("saveLimitPickHint")}</p>
            <ul className="saved-limit-list">
              {recipes.map(recipe => (
                <li key={recipe.id} className="saved-limit-item">
                  <div className="saved-limit-item-content">
                    <div className="saved-limit-item-ingredients">
                      {recipe.ingredients.slice(0, 4).join(", ")}
                      {recipe.ingredients.length > 4 ? "..." : ""}
                    </div>
                    <div className="saved-limit-item-date">
                      {t("savedOn", { date: new Date(recipe.savedAt).toLocaleDateString() })}
                    </div>
                  </div>
                  <button
                    className="delete-recipe-btn"
                    onClick={() => onDelete(recipe.id)}
                    aria-label={t("deleteRecipe")}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
            <div className="saved-limit-actions">
              <button className="duplicate-btn-secondary" onClick={onCancel}>
                {t("saveLimitCancel")}
              </button>
            </div>
          </>
        )}
    </Modal>
  )
}

export default SavedLimitModal