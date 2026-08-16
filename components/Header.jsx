import chefKittyLogo from "../media/chef_kitten.png"
import { useTranslation } from 'react-i18next';
import { BookmarkIcon } from "./Icons"

export default function Header ({ onHistoryClick, onSavedClick }) {
  const { t } = useTranslation();

  return (
    <header>
      <div className="header-center">
        <img src={chefKittyLogo} alt={t("logoAlt")} />
        <h1>{t("appTitle")}</h1>
      </div>
      <div className="header-actions">
        <button className="header-action-btn" onClick={onHistoryClick} aria-label={t("history")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="action-label">{t("history")}</span>
        </button>
        <button className="header-action-btn" onClick={onSavedClick} aria-label={t("saved")}>
          <BookmarkIcon />
          <span className="action-label">{t("saved")}</span>
        </button>
      </div>
    </header>
  )
}