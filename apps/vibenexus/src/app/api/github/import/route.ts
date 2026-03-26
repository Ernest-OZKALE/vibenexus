import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ProjectStatus } from '@/lib/types'

export async function POST(req: NextRequest) {
    try {
        const { repos } = await req.json()
        if (!Array.isArray(repos) || repos.length === 0) {
            return NextResponse.json({ error: 'Aucun dépôt sélectionné' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

        const results = []
        for (const repo of repos) {
            const { data, error } = await supabase
                .from('projects')
                .insert({
                    title: repo.name,
                    description: repo.description || `Projet importé de GitHub: ${repo.full_name}`,
                    status: 'stable' as ProjectStatus,
                    user_id: user.id,
                    github_repo_full_name: repo.full_name,
                    github_default_branch: repo.default_branch,
                    repo_url: repo.html_url,
                    tech_debt_score: 0
                })
                .select()
                .single()

            if (error) {
                console.error(`Error importing ${repo.full_name}:`, error)
                results.push({ name: repo.name, status: 'error', error: error.message })
            } else {
                results.push({ name: repo.name, status: 'success', id: data.id })
            }
        }

        return NextResponse.json({ results })
    } catch (err) {
        console.error('Error in Bulk Import API:', err)
        return NextResponse.json({ error: 'Erreur lors de l\'importation' }, { status: 500 })
    }
}
