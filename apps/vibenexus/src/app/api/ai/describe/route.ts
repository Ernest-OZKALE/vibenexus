import { NextResponse } from 'next/server'
import { Groq } from 'groq-sdk'

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: Request) {
    try {
        const { readmeContent } = await req.json()

        if (!readmeContent) {
            return NextResponse.json({ error: 'README content is required' }, { status: 400 })
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Vous êtes un expert en marketing produit et technical writer. 
                    Votre mission est de rédiger une description Courte, Percutante et Professionnelle pour un projet logiciel, en vous basant sur son README.
                    
                    Règles :
                    - Langue : Français exclusivement.
                    - Longueur : Maximum 2 phrases.
                    - Ton : Moderne, visionnaire, efficace.
                    - Focus : La valeur ajoutée du projet.
                    
                    Ne retournez QUE le texte de la description, rien d'autre.`
                },
                {
                    role: 'user',
                    content: `Voici le contenu du README :\n\n${readmeContent}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
        })

        const description = completion.choices[0]?.message?.content?.trim() || ''

        return NextResponse.json({ description })
    } catch (error) {
        console.error('Error generating description:', error)
        return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
    }
}
