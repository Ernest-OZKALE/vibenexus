import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getRepoWorkflowRuns, triggerWorkflowDispatch } from '@/lib/github'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        const cookieStore = await cookies()
    const providerToken = cookieStore.get('github_provider_token')?.value

    if (!providerToken) {
            return NextResponse.json({ error: 'Non authentifié avec GitHub' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const repoFullName = searchParams.get('repo')

        if (!repoFullName) {
            return NextResponse.json({ error: 'Nom du dépôt requis' }, { status: 400 })
        }

        const runs = await getRepoWorkflowRuns(providerToken, repoFullName)
        return NextResponse.json(runs)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        const cookieStore = await cookies()
    const providerToken = cookieStore.get('github_provider_token')?.value

    if (!providerToken) {
            return NextResponse.json({ error: 'Non authentifié avec GitHub' }, { status: 401 })
        }

        const body = await request.json()
        const { repoFullName, workflowId, ref } = body

        if (!repoFullName || !workflowId || !ref) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
        }

        await triggerWorkflowDispatch(providerToken, repoFullName, workflowId, ref)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
