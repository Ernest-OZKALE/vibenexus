import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { generateReadmeTemplate } from '@/lib/github'

const getGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_for_build' })

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, description, status, techStack, repoUrl, deployUrl, workspaceContext } = body

        if (!title) {
            return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
        }

        const groq = getGroqClient()

        const promptContext = `
            TITRE: ${title}
            DESCRIPTION: ${description || 'N/A'}
            STATUT: ${status || 'idéation'}
            TECH STACK: ${techStack?.join(', ') || 'N/A'}
            REPO: ${repoUrl || 'N/A'}
            DEPLOY: ${deployUrl || 'N/A'}
            
            WORKSPACE CONTEXT:
            ${JSON.stringify(workspaceContext, null, 2)}
        `

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS.readmeAgent },
                { role: 'user', content: promptContext }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
        })

        const readme = completion.choices[0]?.message?.content

        if (!readme) {
            // Fallback to static template if AI fails
            const fallback = generateReadmeTemplate({ title, description, status, techStack, repoUrl, deployUrl })
            return NextResponse.json({ readme: fallback, isFallback: true })
        }

        return NextResponse.json({ readme })
    } catch (err) {
        console.error('Error generating README:', err)
        return NextResponse.json({ error: 'Erreur génération' }, { status: 500 })
    }
}
