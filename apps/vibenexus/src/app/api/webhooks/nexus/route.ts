import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase environment variables')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        const url = new URL(request.url)
        const projectId = url.searchParams.get('projectId')
        const source = url.searchParams.get('source') || 'webhook'

        const body = await request.json()

        if (!projectId) {
            return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
        }

        let logContent = ''
        let logType = 'journal'

        // Logique spécifique par source
        if (source === 'github') {
            const repo = body.repository?.full_name
            const pusher = body.pusher?.name
            const commits = body.commits?.length || 0
            const lastCommit = body.commits?.[0]?.message
            logContent = `[GitHub] ${pusher} a poussé ${commits} commit(s) sur ${repo}.\n\nDernier message: ${lastCommit}`
        } else if (source === 'vercel') {
            const status = body.type // 'deployment.succeeded', etc.
            const url = body.payload?.url
            logContent = `[Vercel] Déploiement réussi sur ${url}. Statut: ${status}`
        } else {
            logContent = `[Webhook Unknown] Event reçu: ${JSON.stringify(body).slice(0, 100)}...`
        }

        // Création du log dans Supabase
        const { error } = await supabase
            .from('logs')
            .insert({
                project_id: projectId,
                content: logContent,
                log_type: logType,
                created_at: new Date().toISOString()
            })

        if (error) throw error

        return NextResponse.json({ status: 'success', message: 'Log created' })

    } catch (err) {
        console.error('Webhook Error:', err)
        return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 })
    }
}
