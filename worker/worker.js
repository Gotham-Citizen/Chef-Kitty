import { SYSTEM_PROMPT_TEMPLATES, EXISTING_RECIPE_TEMPLATES, USER_MESSAGE_TEMPLATES} from './prompts.js'

function buildUserMessage(ingredients, language) {
  const template = USER_MESSAGE_TEMPLATES[language] || USER_MESSAGE_TEMPLATES.en
  return template(ingredients)
}

function buildSystemPrompt(language, existingRecipe) {
  const promptTemplate = SYSTEM_PROMPT_TEMPLATES[language] || SYSTEM_PROMPT_TEMPLATES.en
  let prompt = promptTemplate()
  if (existingRecipe) {
    const existingTemplate = EXISTING_RECIPE_TEMPLATES[language] || EXISTING_RECIPE_TEMPLATES.en
    prompt += existingTemplate(existingRecipe)
  }
  return prompt
}

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://gotham-citizen.github.io',
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

const MAX_GROQ_RETRIES = 2
const RETRYABLE_STATUSES = new Set([429, 502, 503])

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function retryDelayMs(groqResponse) {
    const retryAfter = Number(groqResponse.headers.get('Retry-After'))
    if (Number.isFinite(retryAfter) && retryAfter > 0) {
        return Math.min(retryAfter * 1000, 2000)
    }
    return 500
}

async function callGroq(env, payload) {
    let lastResponse
    for (let attempt = 0; attempt <= MAX_GROQ_RETRIES; attempt++) {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.GROQ_API_KEY}`,
            },
            body: JSON.stringify(payload),
        })
        if (groqResponse.ok) return groqResponse
        lastResponse = groqResponse
        if (!RETRYABLE_STATUSES.has(groqResponse.status)) return groqResponse
        if (attempt < MAX_GROQ_RETRIES) await sleep(retryDelayMs(groqResponse))
    }
    return lastResponse
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

            const { ingredients, language, existingRecipe } = await request.json()
            console.log('Parsed ingredients:', JSON.stringify(ingredients))

            if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
                return new Response(JSON.stringify({ error: 'No ingredients provided' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            const groqResponse = await callGroq(env, {
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: buildSystemPrompt(language || 'en', existingRecipe) },
                    { role: 'user', content: buildUserMessage(ingredients, language || 'en') },
                ],
                max_tokens: 4096,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "recipe_response",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                recipe: { type: "string", description: "The complete recipe as a single markdown string" },
                            },
                            required: ["recipe"],
                            additionalProperties: false,
                        },
                    },
                },
            })

            if (!groqResponse.ok) {
                const errorText = await groqResponse.text()
                console.error('Groq API error:', groqResponse.status, errorText)
                const responseStatus = groqResponse.status >= 500 || groqResponse.status === 429
                    ? groqResponse.status
                    : 502
                return new Response(JSON.stringify({ error: 'Groq API request failed', status: groqResponse.status }), {
                    status: responseStatus,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            const completion = await groqResponse.json()
            const parsed = JSON.parse(completion.choices[0].message.content)
            const recipe = parsed.recipe

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