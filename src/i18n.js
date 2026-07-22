const translations = {
  en: {
    appTitle: "Chef Claude",
    ingredientPlaceholder: "e.g. oregano",
    addIngredient: "Add ingredient",
    ingredientsOnHand: "Ingredients on hand:",
    readyForRecipe: "Ready for a recipe?",
    generateRecipe: "Generate a recipe from your list of ingredients.",
    getRecipe: "Get a recipe",
    loading: "Loading...",
    chefRecommends: "Chef Claude Recommends:",
    generatingRecipe: "Generating recipe...",
    errorInvalidIngredient: "Please enter a valid food ingredient (e.g. oregano, chicken)",
    errorClose: "Close",
    errorNoRecipe: "Failed to generate recipe. Please try again.",
    removeAriaLabel: "Remove {item}",
    logoAlt: "Chef Claude logo",
  },
  zh: {
    appTitle: "Chef Claude",
    ingredientPlaceholder: "例如 牛至",
    addIngredient: "添加食材",
    ingredientsOnHand: "现有食材：",
    readyForRecipe: "准备好做饭了吗？",
    generateRecipe: "根据您的食材列表生成食谱。",
    getRecipe: "生成食谱",
    loading: "加载中...",
    chefRecommends: "Chef Claude推荐",
    generatingRecipe: "正在生成食谱...",
    errorInvalidIngredient: "请输入有效的食材（例如 鸡肉、米饭）",
    errorClose: "关闭",
    errorNoRecipe: "生成食谱失败，请重试。",
    removeAriaLabel: "移除 {item}",
    logoAlt: "Chef Claude 标志",
  },
}

export function detectLanguage() {
  const raw = navigator.language || navigator.userLanguage || "en"
  const base = raw.split("-")[0]
  if (base === "zh") return "zh"
  return "en"
}

export function t(key, lang, args) {
  const dict = translations[lang] || translations.en
  let value = dict[key]
  if (value === undefined) {
    value = translations.en[key]
  }
  if (value === undefined) return key
  if (args) {
    for (const [k, v] of Object.entries(args)) {
      value = value.replace(`{${k}}`, v)
    }
  }
  return value
}
