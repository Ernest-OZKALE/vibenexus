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
        // Fetch deployments
        const response = await fetch(`https://api.github.com/repos/${repoFullName}/deployments?per_page=5`, {
            headers: {
                'Authorization': `Bearer ${providerToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        })

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const deployments = await response.json()

        // For each deployment, fetch statuses
        const deploymentsWithStatus = await Promise.all((deployments as any[]).map(async (dep) => {
            const statusRes = await fetch(dep.statuses_url, {
                headers: {
                    'Authorization': `Bearer ${providerToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
            const statuses = await statusRes.json()
            return {
                id: dep.id,
                environment: dep.environment,
                description: dep.description,
                created_at: dep.created_at,
                status: statuses[0]?.state || 'unknown',
                target_url: statuses[0]?.target_url || null
            }
        }))

        return NextResponse.json(deploymentsWithStatus)
    } catch (error: any) {
        console.error('Error fetching GitHub deployments:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
