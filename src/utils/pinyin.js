let pinyinFn = null
let libPromise = null

export function loadPinyin() {
  if (!libPromise) {
    libPromise = import("pinyin-pro").then(m => {
      pinyinFn = m.pinyin
    })
  }
  return libPromise
}

const pinyinCache = new Map()
const initialsCache = new Map()

export function getPinyin(text) {
  if (!pinyinFn) return ""
  if (pinyinCache.has(text)) return pinyinCache.get(text)
  const value = pinyinFn(text, { toneType: "none", type: "array", nonZh: "consecutive" })
    .join("")
    .toLowerCase()
  pinyinCache.set(text, value)
  return value
}

export function getPinyinInitials(text) {
  if (!pinyinFn) return ""
  if (initialsCache.has(text)) return initialsCache.get(text)
  const value = pinyinFn(text, { toneType: "none", type: "array" })
    .map(syllable => syllable[0])
    .join("")
    .toLowerCase()
  initialsCache.set(text, value)
  return value
}
