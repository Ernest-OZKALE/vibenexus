import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { cookies } from 'next/headers'

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_for_build' })

export async function POST(request: NextRequest) {
    try {
        const { workspaceContext } = await request.json()
        if (!workspaceContext) {
            return NextResponse.json({ error: 'Context workspace requis pour l\'audit Staff Engineer' }, { status: 400 })
        }

        const groq = getGroqClient()
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS.staffEngineer + "\nIMPORTANT: Votre analyse doit être extrêmement technique et pertinente. Identifiez les vrais 'hotspots' de dette technique ou de failles de sécurité." },
                { role: 'user', content: `Voici le contexte technique complet du projet pour analyse : ${JSON.stringify(workspaceContext)}` }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        })

        const rawJson = completion.choices[0]?.message?.content
        if (!rawJson) throw new Error('Aucune réponse générée par l\'IA Nexus')

        // Clean up potential markdown code blocks if the AI ignored instructions
        const sanitized = rawJson.replace(/```json\n?|```/g, '').trim()

        try {
            const parsed = JSON.parse(sanitized)
            return NextResponse.json({ analysis: parsed })
        } catch (parseErr) {
            console.error('JSON Parse Error:', rawJson)
            throw new Error('La réponse de l\'IA n\'est pas un JSON valide.')
        }
    } catch (err: any) {
        console.error('Error in Staff Engineer Audit:', err)
        return NextResponse.json({ error: 'Échec de l\'analyse intelligence : ' + err.message }, { status: 500 })
    }
}
