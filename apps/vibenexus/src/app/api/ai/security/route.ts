import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || 'dummy_for_build',
    })

    try {
        const { projectContext, requirements } = await request.json()

        const dataContext = `
        Prérequis demandés: ${requirements?.join(', ') || 'Standards Base Sécurité'}
        Contexte Projet: ${JSON.stringify(projectContext || {})}
        `

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS.securityHardeningAgent },
                { role: 'user', content: dataContext },
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            temperature: 0.1,
        })

        const securityData = JSON.parse(completion.choices[0].message.content || '{}')

        return NextResponse.json(securityData)

    } catch (err) {
        console.error('Security Generation Error:', err)
        return NextResponse.json({ error: 'Échec de la génération Sécurité' }, { status: 500 })
    }
}
