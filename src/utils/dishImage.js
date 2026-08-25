import { similarity } from "./levenshtein"

const THE_MEAL_DB_URL = "https://www.themealdb.com/api/json/v1/1/search.php"
const WIKIMEDIA_URL = "https://commons.wikimedia.org/w/api.php"

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "")
    .trim()
}

function nameMatches(mealName, searchTerm) {
  const normalizedMeal = normalizeName(mealName)
  const normalizedTerm = normalizeName(searchTerm)
  if (!normalizedMeal || !normalizedTerm) return false
  if (normalizedTerm.length >= 3 && normalizedMeal.includes(normalizedTerm)) return true
  if (normalizedMeal.length >= 3 && normalizedTerm.includes(normalizedMeal)) return true
  return similarity(normalizedMeal, normalizedTerm) >= 0.5
}

async function fetchWithTimeout(url, timeoutMs = 6000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function searchTheMealDB(searchTerm) {
  const url = `${THE_MEAL_DB_URL}?s=${encodeURIComponent(searchTerm)}`
  const response = await fetchWithTimeout(url)
  if (!response.ok) return null
  const data = await response.json()
  const meal = data?.meals?.find(m => nameMatches(m.strMeal, searchTerm))
  return meal?.strMealThumb || null
}

async function searchWikimedia(searchTerm) {
  const url = new URL(WIKIMEDIA_URL)
  url.searchParams.set("action", "query")
  url.searchParams.set("generator", "search")
  url.searchParams.set("gsrsearch", searchTerm)
  url.searchParams.set("gsrnamespace", "6")
  url.searchParams.set("gsrlimit", "5")
  url.searchParams.set("prop", "imageinfo")
  url.searchParams.set("iiprop", "url")
  url.searchParams.set("format", "json")
  url.searchParams.set("origin", "*")
  const response = await fetchWithTimeout(url)
  if (!response.ok) return null
  const data = await response.json()
  const pages = data?.query?.pages
  if (!pages) return null
  const page = Object.values(pages).find(p => {
    const imageUrl = p?.imageinfo?.[0]?.url
    return imageUrl && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(imageUrl)
  })
  return page?.imageinfo?.[0]?.url || null
}

export async function getDishImage(dishName, dishNameEn) {
  const searchTerm = (dishNameEn || dishName || "").trim()
  if (searchTerm) {
    try {
      const mealDbPhoto = await searchTheMealDB(searchTerm)
      if (mealDbPhoto) return mealDbPhoto
    } catch { /* fall through to next source */ }
    try {
      const wikiPhoto = await searchWikimedia(searchTerm)
      if (wikiPhoto) return wikiPhoto
    } catch { /* fall through to next source */ }
    if (dishName && normalizeName(dishName) !== normalizeName(searchTerm)) {
      try {
        const nativePhoto = await searchWikimedia(dishName)
        if (nativePhoto) return nativePhoto
      } catch { /* no photo found */ }
    }
  }
  return null
}