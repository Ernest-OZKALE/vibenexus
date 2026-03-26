import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createEvent } from '@/lib/queries'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // 1. Fetch all projects with a deploy_url
        const { data: projects, error } = await supabase
            .from('projects')
            .select('id, title, deploy_url, user_id')
            .not('deploy_url', 'is', null)

        if (error) throw error
        if (!projects || projects.length === 0) {
            return NextResponse.json({ message: 'Aucun projet à surveiller' })
        }

        const results = []

        // 2. Ping each URL
        for (const project of projects) {
            try {
                const start = Date.now()
                const res = await fetch(project.deploy_url!, {
                    method: 'GET',
                    next: { revalidate: 0 }, // Disable cache 
                    signal: AbortSignal.timeout(5000) // 5s timeout
                })
                const latency = Date.now() - start

                if (!res.ok) {
                    await createEvent(
                        'healthcheck_fail',
                        `Indisponibilité détectée : ${project.title}`,
                        `Le site a répondu avec un statut ${res.status}.`,
                        { projectId: project.id, url: project.deploy_url, status: res.status }
                    )
                    results.push({ id: project.id, status: 'down', code: res.status })
                } else {
                    results.push({ id: project.id, status: 'up', latency })
                }
            } catch (err: any) {
                await createEvent(
                    'healthcheck_fail',
                    `Crash système détecté : ${project.title}`,
                    `Impossible de joindre le serveur. Erreur : ${err.message}`,
                    { projectId: project.id, url: project.deploy_url, error: err.message }
                )
                results.push({ id: project.id, status: 'error', error: err.message })
            }
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            totalChecked: projects.length,
            results
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
