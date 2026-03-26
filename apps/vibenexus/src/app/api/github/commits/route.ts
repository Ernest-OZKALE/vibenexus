import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getRepoCommits } from '@/lib/github'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const repo = searchParams.get('repo')

        if (!repo) {
            return NextResponse.json({ error: 'Paramètre repo requis' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        const cookieStore = await cookies()
    const providerToken = cookieStore.get('github_provider_token')?.value

    if (!providerToken) {
            return NextResponse.json({ error: 'Non connecté à GitHub' }, { status: 401 })
        }

        const commits = await getRepoCommits(providerToken, repo)

        const result = commits.map(c => ({
            sha: c.sha.substring(0, 7),
            full_sha: c.sha,
            message: c.commit.message.split('\n')[0], // First line only
            author_name: c.commit.author.name,
            author_avatar: c.author?.avatar_url || null,
            committed_at: c.commit.author.date,
            url: c.html_url,
        }))

        return NextResponse.json(result)
    } catch (err) {
        console.error('Error fetching commits:', err)
        return NextResponse.json({ error: 'Erreur GitHub API' }, { status: 500 })
    }
}
