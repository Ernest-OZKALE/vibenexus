import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY || 'dummy_for_build',
    })

    try {
        const { logs, commits, projectTitle } = await request.json()

        if (!logs && !commits) {
            return NextResponse.json({ error: 'Données insuffisantes' }, { status: 400 })
        }

        const dataContext = `
        Projet: ${projectTitle}
        
        Logs récents:
        ${logs?.map((l: any) => `- [${l.log_type}] ${l.content}`).join('\n')}
        
        Commits récents:
        ${commits?.map((c: any) => `- ${c.message}`).join('\n')}
        `

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS.autonomousADR },
                { role: 'user', content: dataContext },
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            temperature: 0.2,
        })

        const adr = JSON.parse(completion.choices[0].message.content || '{}')

        return NextResponse.json(adr)

    } catch (err) {
        console.error('ADR Generation Error:', err)
        return NextResponse.json({ error: 'Échec de la génération de l\'ADR' }, { status: 500 })
    }
}
