import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_for_build' })

export async function POST(request: NextRequest) {
    try {
        const { workspaceContext } = await request.json()
        if (!workspaceContext) return NextResponse.json({ error: 'Context requis' }, { status: 400 })

        const groq = getGroqClient()
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Vous êtes un expert en documentation technique. Votre but est d'extraire des faits marquants (Knowledge Cards) d'un projet à partir de son arborescence et de ses fichiers.
                    Répondez exclusivement en FRANÇAIS.
                    Générez 3 à 5 cartes concises couvrant :
                    1. La stack technique principale.
                    2. Les points d'entrée clés.
                    3. La logique métier détectée.
                    
                    Répondez STRICTEMENT en JSON :
                    {
                      "cards": [
                        { "title": "string", "content": "string", "category": "architecture|logic|business|devops" }
                      ]
                    }`
                },
                { role: 'user', content: JSON.stringify(workspaceContext) }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2,
            response_format: { type: 'json_object' }
        })

        const rawJson = completion.choices[0]?.message?.content
        if (!rawJson) throw new Error('No AI response')

        return NextResponse.json(JSON.parse(rawJson))
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
