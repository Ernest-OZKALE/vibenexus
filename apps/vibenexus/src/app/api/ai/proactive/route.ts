import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const groqKey = process.env.GROQ_API_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const groq = new Groq({ apiKey: groqKey || '' })

    try {
        // 1. Get all projects and their recent state
        const { data: projects } = await supabase
            .from('projects')
            .select('id, title, status, tech_debt_score, is_zombie')
            .limit(10)

        const { data: recentEvents } = await supabase
            .from('events')
            .select('*, projects(title)')
            .order('created_at', { ascending: false })
            .limit(20)

        // 2. Perform AI Analysis (Simulated for speed, actual Groq call would be here)
        // Let's call Groq if we have a key, else fallback to rule-based
        let actions = []

        if (groqKey && projects && projects.length > 0) {
            const prompt = `Analyze the health of this project fleet and suggest 2-3 proactive actions.
            Projects: ${JSON.stringify(projects)}
            Recent Events: ${JSON.stringify(recentEvents)}
            
            Return ONLY a JSON object with an "actions" array. Each action:
            { id, projectId, projectTitle, type: "critical"|"suggestion"|"optimization", message, actionLabel, impact }`

            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                response_format: { type: 'json_object' }
            })

            const res = JSON.parse(completion.choices[0].message.content || '{"actions": []}')
            actions = res.actions
        } else {
            // Rule-based fallback if no AI key
            if (projects) {
                projects.forEach(p => {
                    if (p.is_zombie && p.status !== 'cimetière') {
                        actions.push({
                            id: `zombie-${p.id}`,
                            projectId: p.id,
                            projectTitle: p.title,
                            type: 'suggestion',
                            message: `Projet identifié comme 'Zombie'. Envisagez l'archivage.`,
                            actionLabel: 'Archiver',
                            impact: 'Nettoyage du Hub'
                        })
                    }
                    if (p.tech_debt_score > 70) {
                        actions.push({
                            id: `debt-${p.id}`,
                            projectId: p.id,
                            projectTitle: p.title,
                            type: 'optimization',
                            message: `Dette technique élevée (${p.tech_debt_score}%). Prévoyez un audit.`,
                            actionLabel: 'Lancer l\'audit',
                            impact: 'Stabilité long-terme'
                        })
                    }
                })
            }
        }

        return NextResponse.json({ actions: actions.slice(0, 3) })
    } catch (err) {
        console.error('Proactive API Error:', err)
        return NextResponse.json({ actions: [] })
    }
}
