import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { ideaContent } = await request.json()
        if (!ideaContent) return NextResponse.json({ error: 'Contenu requis' }, { status: 400 })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch settings for Groq key
        const { data: settings } = await supabase
            .from('nexus_settings')
            .select('groq_api_key')
            .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000000')
            .single()

        const apiKey = settings?.groq_api_key || process.env.GROQ_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'Clé API Groq manquante.' }, { status: 400 })
        }

        const groq = new Groq({ apiKey })
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPTS.technicalSpec },
                { role: 'user', content: `IDEA: ${ideaContent}` }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2,
            response_format: { type: 'json_object' }
        })

        const rawJson = completion.choices[0]?.message?.content
        if (!rawJson) throw new Error('No response from AI')

        return NextResponse.json({ adr: JSON.parse(rawJson) })
    } catch (err) {
        console.error('Error in Innovation Spec:', err)
        return NextResponse.json({ error: 'Erreur génération' }, { status: 500 })
    }
}
