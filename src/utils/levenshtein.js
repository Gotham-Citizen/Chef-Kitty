export function levenshteinDistance(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const curr = Array.from({ length: n + 1 }, (_, j) => j === 0 ? i : 0)
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      )
    }
    prev = curr
  }
  return prev[n]
}

export function similarity(a, b) {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshteinDistance(a, b) / maxLen
}

export function isSimilarEnough(a, b, threshold = 0.8) {
  if (!a || !b) return false
  const minLen = Math.min(a.length, b.length)
  const maxLen = Math.max(a.length, b.length)
  if (minLen / maxLen < 0.6) return false
  return similarity(a, b) >= threshold
}
