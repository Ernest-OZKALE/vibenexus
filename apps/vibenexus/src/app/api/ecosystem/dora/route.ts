import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRecentCommitsCount } from '@/lib/github'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const repo = searchParams.get('repo')

    if (!repo) return NextResponse.json({ error: 'Repo is required' }, { status: 400 })

    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session || !session.provider_token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const count = await getRecentCommitsCount(session.provider_token, repo, 30)

        let frequencyLabel = 'Low'
        let color = '#EF4444' // Red

        if (count >= 15) {
            frequencyLabel = 'Elite (Daily)'
            color = '#10B981' // Green
        } else if (count >= 4) {
            frequencyLabel = 'High (Weekly)'
            color = '#3B82F6' // Blue
        } else if (count > 0) {
            frequencyLabel = 'Medium (Monthly)'
            color = '#F59E0B' // Orange
        }

        return NextResponse.json({ count, frequencyLabel, color })
    } catch (error) {
        console.error('DORA Metrics fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch DORA metrics' }, { status: 500 })
    }
}
