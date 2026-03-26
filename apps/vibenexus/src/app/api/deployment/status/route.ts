import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') // Vercel Project ID or Name

    if (!projectId) return NextResponse.json({ error: 'ID de projet requis' }, { status: 400 })

    try {
        // 1. Get Vercel Token from Supabase nexus_settings
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: settings } = await supabase
            .from('nexus_settings')
            .select('vercel_token')
            .single()

        if (!settings?.vercel_token) {
            return NextResponse.json({ error: 'Token Vercel non configuré' }, { status: 403 })
        }

        // 2. Fetch from Vercel API
        const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
            headers: {
                Authorization: `Bearer ${settings.vercel_token}`
            }
        })

        if (!res.ok) throw new Error('Vercel API error')
        const data = await res.json()

        // 3. Transform to simplified status
        const latestDeployment = data.latestDeployments?.[0]

        return NextResponse.json({
            status: latestDeployment?.readyState || 'UNKNOWN',
            url: latestDeployment?.url || null,
            updatedAt: latestDeployment?.updatedAt || null
        })

    } catch (err) {
        console.error('Error fetching Vercel status:', err)
        return NextResponse.json({ error: 'Impossible de joindre Vercel' }, { status: 500 })
    }
}
