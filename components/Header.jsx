import chefClaudeLogo from "../media/chef-claude-icon.png"
import { useLanguage } from "../src/LanguageContext"

export default function Header () {
  const { t } = useLanguage()
  return (
    <header>
      <img src={chefClaudeLogo} alt={t("logoAlt")} />
      <h1>{t("appTitle")}</h1>
    </header>
  )
}