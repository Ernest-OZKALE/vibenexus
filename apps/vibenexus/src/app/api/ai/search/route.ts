import { NextRequest, NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { getNexusSettings } from '@/lib/queries'

export async function POST(req: NextRequest) {
    try {
        const { query, projectId } = await req.json()

        if (!query) {
            return NextResponse.json({ error: 'La requête est vide' }, { status: 400 })
        }

        const supabase = await createClient()
        const settings = await getNexusSettings()

        if (!settings?.groq_api_key) {
            return NextResponse.json({ error: 'Clé API Groq manquante dans les réglages' }, { status: 400 })
        }

        const groq = new Groq({ apiKey: settings.groq_api_key })

        // 1. Fetch relevant knowledge items for the project
        const { data: knowledge, error: kError } = await supabase
            .from('project_knowledge')
            .select('*')
            .eq('project_id', projectId)

        if (kError) throw kError

        if (!knowledge || knowledge.length === 0) {
            return NextResponse.json({
                answer: "Je n'ai pas encore de connaissances spécifiques stockées pour ce projet. Ajoutez des fiches dans la Base de Connaissances pour que je puisse vous aider.",
                sources: []
            })
        }

        // 2. IA analysis to find the best matching info
        const context = knowledge.map(k => `[ID: ${k.id}, Catégorie: ${k.category}] ${k.title}: ${k.content}`).join('\n---\n')

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Tu es l'Intelligence Nexus. Ton rôle est de répondre aux questions techniques sur un projet en te basant UNIQUEMENT sur la Base de Connaissances fournie ci-dessous.
                    Si la réponse n'est pas dans le contexte, dis-le poliment.
                    Réponds en français, de manière concise et professionnelle. 
                    Structure ta réponse avec du Markdown. 
                    Si tu cites une info, mentionne le titre de la fiche entre crochets.

                    CONTEXTE DU PROJET:
                    ${context}`
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
        })

        const answer = completion.choices[0]?.message?.content || "Je n'ai pas pu générer de réponse."

        return NextResponse.json({ answer })
    } catch (err: any) {
        console.error('Semantic Search Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
