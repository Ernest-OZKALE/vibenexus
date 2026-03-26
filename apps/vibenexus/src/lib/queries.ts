import { createClient } from '@/lib/supabase/client'
import type { Project, Idea, Log, Component, ProjectStatus, IdeaStatus, LogType, NexusEvent, NexusEventType } from '@/lib/types'

function getSupabase() {
    return createClient()
}

async function getUserId(): Promise<string> {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // DEV BYPASS: Return a dummy user ID if not authenticated
        console.warn('Nexus: Authentication bypassed (DEV MODE)')
        return '00000000-0000-0000-0000-000000000000'
    }

    return user.id
}

// ============ PROJECTS ============

export async function getProjects() {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
    if (error) throw error
    return data as Project[]
}

export async function getProjectById(id: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()
    if (error) throw error
    return data as Project
}

export async function createProject(title: string, description?: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('projects')
        .insert({ title, description, status: 'idéation' as ProjectStatus, user_id: userId })
        .select()
        .single()
    if (error) throw error
    return data as Project
}

export async function updateProject(id: string, updates: Partial<Project>) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
    if (error) throw error
    return data as Project
}

export async function updateProjectTags(id: string, tags: string[]) {
    const supabase = getSupabase()
    const { data, error } = await supabase
        .from('projects')
        .update({ tags, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as Project
}

export async function deleteProject(id: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}

// ============ IDEAS ============

export async function getIdeas() {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data as Idea[]
}

export async function createIdea(content: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('ideas')
        .insert({ content, status: 'brut' as IdeaStatus, user_id: userId })
        .select()
        .single()
    if (error) throw error
    return data as Idea
}

export async function updateIdea(id: string, updates: Partial<Idea>) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
    if (error) throw error
    return data as Idea
}

export async function deleteIdea(id: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}

export async function convertIdeaToProject(ideaId: string, title: string) {
    const supabase = getSupabase()
    const userId = await getUserId()

    // 1. Create the project
    const { data: project, error: pError } = await supabase
        .from('projects')
        .insert({
            title,
            description: `Issu de l'Innovation Lab : ${title}`,
            status: 'idéation',
            user_id: userId,
            tech_debt_score: 0
        })
        .select()
        .single()

    if (pError) throw pError

    // 2. Update the idea
    const { error: iError } = await supabase
        .from('ideas')
        .update({
            status: 'converti_en_projet',
            project_id: project.id
        })
        .eq('id', ideaId)
        .eq('user_id', userId)

    if (iError) throw iError

    // 3. Create Event
    await createEvent(
        'project_foundry',
        `Forge à Projets : ${title}`,
        `Une nouvelle idée a été cristallisée en projet.`,
        { project_id: project.id, idea_id: ideaId }
    )

    return project as Project
}

// ============ LOGS ============

export async function getLogsByProject(projectId: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (error) throw error
    return data as Log[]
}

export async function createLog(projectId: string, content: string, logType: LogType = 'journal') {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('logs')
        .insert({ project_id: projectId, content, log_type: logType, user_id: userId })
        .select()
        .single()
    if (error) throw error
    return data as Log
}

export async function deleteLog(id: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { error } = await supabase
        .from('logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}

// ============ COMPONENTS (Snippets) ============

export async function getComponents() {
    const supabase = getSupabase()
    const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('created_at', { ascending: false })
    if (error) throw error
    return data as Component[]
}

export async function createComponent(title: string, codeSnippet: string, language?: string, projectId?: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('components')
        .insert({ title, code_snippet: codeSnippet, language, project_id: projectId, user_id: userId })
        .select()
        .single()
    if (error) throw error
    return data as Component
}

export async function deleteComponent(id: string) {
    const supabase = getSupabase()
    const { error } = await supabase.from('components').delete().eq('id', id)
    if (error) throw error
}

// ============ EVENTS (Activity Feed) ============

export async function getEvents() {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('events')
        .select('*, projects(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
    if (error) throw error
    return data as (NexusEvent & { projects: { title: string } | null })[]
}

export async function createEvent(type: NexusEventType, title: string, description?: string, metadata: any = {}) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('events')
        .insert({ type, title, description, metadata, user_id: userId })
        .select()
        .single()
    if (error) throw error
    return data as NexusEvent
}

export async function markEventAsRead(id: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { error } = await supabase
        .from('events')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}

export async function markAllEventsAsRead() {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { error } = await supabase.from('events').update({ is_read: true }).eq('user_id', userId)
    if (error) throw error
}

// ============ SETTINGS ============

export async function getNexusSettings() {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('nexus_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
}

export async function updateNexusSettings(updates: {
    discord_webhook_url?: string;
    slack_webhook_url?: string;
    vercel_token?: string;
    sentry_dsn?: string;
    groq_api_key?: string;
    notifications_enabled?: boolean
}) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('nexus_settings')
        .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single()
    if (error) throw error
    return data
}

// ============ KNOWLEDGE ============

export async function getProjectKnowledge(projectId: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('project_knowledge')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createProjectKnowledge(projectId: string, title: string, content: string, category: string = 'documentation') {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { data, error } = await supabase
        .from('project_knowledge')
        .insert({ project_id: projectId, title, content, category, user_id: userId })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteProjectKnowledge(id: string) {
    const supabase = getSupabase()
    const userId = await getUserId()
    const { error } = await supabase
        .from('project_knowledge')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}



