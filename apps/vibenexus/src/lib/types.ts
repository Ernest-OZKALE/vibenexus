export type ProjectStatus = 'idéation' | 'vibecoding' | 'stable' | 'hibernation' | 'cimetière'

export interface Project {
    id: string
    title: string
    description: string | null
    status: ProjectStatus
    tech_debt_score: number
    repo_url: string | null
    deploy_url: string | null
    github_repo_full_name: string | null
    github_default_branch: string | null
    readme_content: string | null
    is_zombie: boolean
    tags: string[] | null
    local_path: string | null
    vercel_project_id: string | null
    target_supabase_url: string | null
    target_supabase_anon_key: string | null
    feature_flags: Record<string, boolean> | null
    created_at: string
    updated_at: string
}

export interface Commit {
    sha: string
    full_sha?: string
    message: string
    author_name: string
    author_avatar: string | null
    committed_at: string
    url: string
}

export type IdeaStatus = 'brut' | 'validé' | 'rejeté' | 'converti_en_projet'

export interface Idea {
    id: string
    content: string
    status: IdeaStatus
    project_id: string | null
    created_at: string
}

export type LogType = 'journal' | 'prochaine_etape' | 'erreur_critique'

export interface Log {
    id: string
    project_id: string
    content: string
    log_type: LogType
    created_at: string
}

export interface TechStack {
    id: string
    name: string
    category: string | null
}

export interface Component {
    id: string
    project_id: string | null
    title: string
    code_snippet: string
    language: string | null
    created_at: string
}

export interface MappedSecret {
    id: string
    project_id: string
    key_name: string
    description: string | null
    created_at: string
}

// Status config for UI
export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: string; glow: string; bg: string; border: string }> = {
    'idéation': { label: 'Idéation', color: 'text-purple-500', icon: '💡', glow: 'shadow-purple-500/20', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    'vibecoding': { label: 'En plein Vibe', color: 'text-emerald-500', icon: '🔥', glow: 'shadow-green-500/30', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    'stable': { label: 'Stable', color: 'text-blue-500', icon: '🛰️', glow: 'shadow-blue-500/20', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'hibernation': { label: 'Hibernation', color: 'text-amber-500', icon: '❄️', glow: 'shadow-amber-500/20', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'cimetière': { label: 'Cimetière', color: 'text-gray-500', icon: '🪦', glow: 'shadow-gray-500/10', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
}

export type NexusEventType = 'healthcheck_fail' | 'adr_generated' | 'autofix_pr' | 'intelligence_audit' | 'project_foundry'

export interface NexusEvent {
    id: string
    user_id: string
    created_at: string
    type: NexusEventType
    title: string
    description: string | null
    metadata: any
    is_read: boolean
    project_id?: string | null
}
