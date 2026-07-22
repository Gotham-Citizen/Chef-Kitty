const WORKER_URL = import.meta.env.VITE_WORKER_URL

export async function getRecipeFromGroq(ingredientsArr, language = "en") {
    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients: ingredientsArr, language }),
        })
        if (!response.ok) {
            throw new Error(`Worker responded with status ${response.status}`)
        }
        const data = await response.json()
        return data.recipe
    } catch (err) {
        console.error(err.message)
        throw err
    }
}