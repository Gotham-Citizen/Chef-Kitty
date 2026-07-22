const LANGUAGE_NAMES = {
  en: 'English',
  zh: 'Chinese',
}

const USER_MESSAGE_TEMPLATES = {
  en: (ingredients) =>
    `I have ${ingredients.join(', ')}. Give me a recipe you'd recommend I make!`,
  zh: (ingredients) =>
    `我有${ingredients.join('、')}。推荐一个你能用这些食材做的食谱！`,
}

function buildUserMessage(ingredients, language) {
  const template = USER_MESSAGE_TEMPLATES[language] || USER_MESSAGE_TEMPLATES.en
  return template(ingredients)
}

function buildSystemPrompt(language) {
  const langName = LANGUAGE_NAMES[language] || 'English'
  return `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page.

IMPORTANT: You MUST respond entirely in ${langName}. Do NOT use any other language. Do NOT mix languages. Every single word must be in ${langName}.
`
}

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://Gotham-Citizen.github.io',
]

function getCorsHeaders(request) {
    const origin = request.headers.get('Origin')
    const isAllowed = ALLOWED_ORIGINS.includes(origin)
    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : '',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
}

export default {
    async fetch(request, env) {
        const corsHeaders = getCorsHeaders(request)
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders })
        }

        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        try {
            const rawBody = await request.clone().text()
            console.log('Raw body received:', rawBody)

            const { ingredients, language } = await request.json()
            console.log('Parsed ingredients:', JSON.stringify(ingredients))

            if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
                return new Response(JSON.stringify({ error: 'No ingredients provided' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: buildSystemPrompt(language || 'en') },
                        { role: 'user', content: buildUserMessage(ingredients, language || 'en') },
                    ],
                    max_tokens: 2048,
                }),
            })

            if (!groqResponse.ok) {
                const errorText = await groqResponse.text()
                console.error('Groq API error:', groqResponse.status, errorText)
                return new Response(JSON.stringify({ error: 'Groq API request failed' }), {
                    status: 502,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            const completion = await groqResponse.json()
            const recipe = completion.choices[0].message.content

            return new Response(JSON.stringify({ recipe }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        } catch (err) {
            console.error(err)
            return new Response(JSON.stringify({ error: 'Failed to generate recipe' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }
    },
}