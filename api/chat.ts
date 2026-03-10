// Vercel provides types automatically at runtime
// For local development, we use any types
export default async function handler(
    request: any,
    response: any
) {
    // Only allow POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, model, agent, messages } = request.body;

        // Get API key from environment
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return response.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
        }

        // Map frontend model names to OpenRouter model IDs
        let openRouterModel = 'anthropic/claude-3.7-sonnet'; // Default

        if (model === 'Shifty 2.0 by Shift AI') {
            openRouterModel = 'anthropic/claude-3.7-sonnet';
        } else if (model === 'Claude Sonnet 4.6') {
            openRouterModel = 'anthropic/claude-3.7-sonnet';
        } else if (model === 'Gemini 3.1 Flash') {
            openRouterModel = 'google/gemini-2.0-flash-001';
        } else if (model === 'GPT 5.4') {
            openRouterModel = 'openai/gpt-4o';
        } else if (model === 'Gemini 3.1 Pro') {
            openRouterModel = 'google/gemini-2.5-flash';
        } else if (model === 'Claude Opus 4.6') {
            openRouterModel = 'anthropic/claude-3-opus';
        } else if (model === 'Moonshot Kimi K2.5') {
            openRouterModel = 'moonshotai/kimi-k2.5';
        }

        // Map agents to system prompts
        let systemPrompt = 'Eres Shifty, el asistente de IA corporativo de Shift. Eres altamente capaz, profesional y directo. Tu objetivo es ayudar a los empleados de la agencia con cualquier tarea general, desde redacción hasta análisis básico. Nunca menciones que eres un modelo de Anthropic, OpenAI o Google. Eres una herramienta propietaria de Shift AI.';

        if (agent === 'Brand Guardian') {
            systemPrompt = 'Eres el guardián estricto del tono y valores de la marca. Tu objetivo es auditar y reescribir el contenido proporcionado para asegurar que cumpla con las guías de estilo corporativas, manteniendo una voz premium, segura y alineada con la misión de la empresa. Nunca permitas lenguaje riesgoso o fuera de marca.';
        } else if (agent === 'Campaign Architect') {
            systemPrompt = 'Eres un estratega de campañas de alto nivel. Tu objetivo es estructurar lanzamientos y campañas publicitarias maximizando el ROI y el Time-to-Market. Piensa en embudos de conversión, KPIs claros y tácticas omnicanal.';
        } else if (agent === 'Insight Miner') {
            systemPrompt = 'Eres un analista de datos y consumidor experto. Tu objetivo es extraer insights accionables, tendencias ocultas y oportunidades de negocio a partir de datos crudos o descripciones de mercado. Habla con precisión y enfócate en el "por qué" detrás del comportamiento del consumidor.';
        } else if (agent === 'Copy Alchemist') {
            systemPrompt = 'Eres un copywriter publicitario de élite. Tu objetivo es transformar ideas aburridas o briefs técnicos en copys persuasivos, emocionales y listos para conversión en múltiples formatos (TikTok, LinkedIn, Ads). Prioriza el gancho y el CTA.';
        }

        // Build messages array
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...(messages || []).map((m: any) => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt }
        ];

        // Call OpenRouter API
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://shifty2-0.vercel.app',
                'X-Title': 'SHIFTY2.0',
            },
            body: JSON.stringify({
                model: openRouterModel,
                messages: apiMessages,
            }),
        });

        if (!openRouterResponse.ok) {
            const errorData = await openRouterResponse.text();
            console.error('OpenRouter API Error:', errorData);
            return response.status(openRouterResponse.status).json({ error: 'Error communicating with AI provider' });
        }

        const data = await openRouterResponse.json();
        return response.status(200).json({ result: data.choices[0].message.content });

    } catch (error) {
        console.error('Server Error:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}