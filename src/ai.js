const WORKER_URL = import.meta.env.VITE_WORKER_URL

const RETRY_STATUSES = new Set([429, 502, 503])
const RETRY_DELAYS = [800, 1600, 3200]
const MAX_ATTEMPTS = RETRY_DELAYS.length + 1

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getRecipeFromGroq(ingredientsArr, language = "en", existingRecipe) {
    const body = { ingredients: ingredientsArr, language }
    if (existingRecipe) body.existingRecipe = existingRecipe

    let lastStatus = null
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        if (response.ok) {
            const data = await response.json()
            return data.recipe
        }

        lastStatus = response.status
        let groqStatus = null
        try {
            const data = await response.json()
            groqStatus = data.status ?? null
        } catch { /* body not JSON */ }

        const isRateLimited = response.status === 429 || groqStatus === 429
        const isRetryable = RETRY_STATUSES.has(response.status) || isRateLimited
        if (!isRetryable || attempt === MAX_ATTEMPTS - 1) {
            throw new Error(`Worker responded with status ${response.status}`, { cause: { status: response.status, isRateLimited } })
        }

        const retryAfter = Number(response.headers.get("Retry-After"))
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 5000)
            : RETRY_DELAYS[attempt]
        await wait(delay)
    }
    throw new Error(`Worker responded with status ${lastStatus}`, { cause: { status: lastStatus, isRateLimited: true } })
}