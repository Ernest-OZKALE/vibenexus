import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_for_build' })

export async function POST(request: NextRequest) {
    try {
        const { projects } = await request.json()
        if (!projects || !Array.isArray(projects)) {
            return NextResponse.json({ error: 'Liste de projets requise' }, { status: 400 })
        }

        const groq = getGroqClient()

        // Summarize projects for the AI
        const fleetContext = projects.map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            tags: p.tags,
            techDebt: p.tech_debt_score,
            isZombie: p.is_zombie
        }))

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Vous êtes le Nexus Fleet Commander. Votre rôle est d'analyser la santé globale d'une flotte de projets. 
                    Vous devez identifier les risques critiques, les opportunités de synergie et les navires en perdition.
                    Répondez STRICTEMENT en JSON valide :
                    {
                        "globalStatus": "STABLE|VULNERABLE|CRITICAL",
                        "strategicAlerts": [
                            { "title": "string", "severity": "HIGH|MEDIUM|LOW", "description": "string", "projectId": "string (optional)" }
                        ],
                        "synergyScore": number (1-100),
                        "recommendations": ["string"]
                    }`
                },
                {
                    role: 'user',
                    content: `Voici l'état actuel de la flotte : ${JSON.stringify(fleetContext)}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        })

        const rawJson = completion.choices[0]?.message?.content
        if (!rawJson) throw new Error('No AI response')

        const audit = JSON.parse(rawJson)

        // Optionally: create Nexus Events for high severity alerts
        const supabase = await createClient()
        for (const alert of audit.strategicAlerts) {
            if (alert.severity === 'HIGH') {
                await supabase.from('nexus_events').insert({
                    type: 'healthcheck_fail',
                    title: `[FLEET ALERT] ${alert.title}`,
                    description: alert.description,
                    metadata: { alert },
                    project_id: alert.projectId
                })
            }
        }

        return NextResponse.json({ audit })
    } catch (err: any) {
        console.error('Fleet Pulse Error:', err)
        return NextResponse.json({ error: 'Échec du pouls de la flotte' }, { status: 500 })
    }
}
