import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || 'dummy_for_build',
    })

    try {
        const { projectContext, targetEnv } = await request.json()

        if (!targetEnv) {
            return NextResponse.json({ error: 'targetEnv requis' }, { status: 400 })
        }

        const dataContext = `
        Cible: ${targetEnv}
        Contexte Projet: ${JSON.stringify(projectContext || {})}
        `

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS.infraGenerator },
                { role: 'user', content: dataContext },
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            temperature: 0.1,
        })

        const infra = JSON.parse(completion.choices[0].message.content || '{}')

        return NextResponse.json(infra)

    } catch (err) {
        console.error('Infra Generation Error:', err)
        return NextResponse.json({ error: 'Échec de la génération Infra' }, { status: 500 })
    }
}
