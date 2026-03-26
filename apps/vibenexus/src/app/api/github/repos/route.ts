import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getUserRepos } from '@/lib/github'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        // Try multiple token sources: session first, then cookie fallback
        let providerToken = session.provider_token

        if (!providerToken) {
            const cookieStore = await cookies()
            providerToken = cookieStore.get('github_provider_token')?.value || null
        }

        if (!providerToken) {
            // Try refreshing the session to get a fresh provider token
            const { data: refreshData } = await supabase.auth.refreshSession()
            providerToken = refreshData?.session?.provider_token || null
        }

        if (!providerToken) {
            return NextResponse.json({ error: 'Non connecté à GitHub' }, { status: 401 })
        }

        const repos = await getUserRepos(providerToken, 1, 100)

        // Get already imported repo names
        const { data: projects } = await supabase
            .from('projects')
            .select('github_repo_full_name')
            .not('github_repo_full_name', 'is', null)

        const importedRepos = new Set(projects?.map(p => p.github_repo_full_name) || [])

        const result = repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            default_branch: repo.default_branch,
            language: repo.language,
            stars: repo.stargazers_count,
            updated_at: repo.updated_at,
            pushed_at: repo.pushed_at,
            is_private: repo.private,
            already_imported: importedRepos.has(repo.full_name),
        }))

        return NextResponse.json(result)
    } catch (err) {
        console.error('Error fetching repos:', err)
        return NextResponse.json({ error: 'Erreur GitHub API' }, { status: 500 })
    }
}
