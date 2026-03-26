import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const repoFullName = searchParams.get('repo')

    if (!repoFullName) {
        return NextResponse.json({ error: 'Repo name is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const cookieStore = await cookies()
    const providerToken = cookieStore.get('github_provider_token')?.value

    if (!providerToken) {
        return NextResponse.json({ error: 'GitHub session not found' }, { status: 401 })
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${repoFullName}/issues?state=open&per_page=10`, {
            headers: {
                'Authorization': `Bearer ${providerToken}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            next: { revalidate: 60 } // Cache for 1 minute
        })

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const issues = await response.json()
        // Filter out Pull Requests (which are returned as issues by GitHub)
        const filteredIssues = (issues as any[]).filter(issue => !issue.pull_request)

        return NextResponse.json(filteredIssues)
    } catch (error: any) {
        console.error('Error fetching GitHub issues:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
