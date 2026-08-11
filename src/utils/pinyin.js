import { pinyin } from "pinyin-pro"

const pinyinCache = new Map()
const initialsCache = new Map()

export function getPinyin(text) {
  if (pinyinCache.has(text)) return pinyinCache.get(text)
  const value = pinyin(text, { toneType: "none", type: "array", nonZh: "consecutive" })
    .join("")
    .toLowerCase()
  pinyinCache.set(text, value)
  return value
}

export function getPinyinInitials(text) {
  if (initialsCache.has(text)) return initialsCache.get(text)
  const value = pinyin(text, { toneType: "none", type: "array" })
    .map(syllable => syllable[0])
    .join("")
    .toLowerCase()
  initialsCache.set(text, value)
  return value
}