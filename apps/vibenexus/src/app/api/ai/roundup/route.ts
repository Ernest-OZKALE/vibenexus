import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_for_build' })

export async function POST(request: NextRequest) {
    try {
        const { logs } = await request.json()
        if (!logs || !Array.isArray(logs)) {
            return NextResponse.json({ error: 'Logs requis' }, { status: 400 })
        }

        const groq = getGroqClient()
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS.weeklyRoundup },
                { role: 'user', content: `LOGS DE LA SEMAINE:\n${JSON.stringify(logs)}` }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        })

        const rawJson = completion.choices[0]?.message?.content
        if (!rawJson) throw new Error('No response from AI')

        return NextResponse.json({ roundup: JSON.parse(rawJson) })
    } catch (err) {
        console.error('Error in Weekly Roundup:', err)
        return NextResponse.json({ error: 'Erreur génération résumé' }, { status: 500 })
    }
}
