'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft, Github, ExternalLink, MessageSquare, Info, Shield, RefreshCw,
    Save, Trash2, ChevronDown, BookOpen, Bot, GitCommit, FileText, Check, Copy, Loader2, Send, ArrowLeft,
    Globe, Activity, AlertTriangle, X, Zap, Sparkles, Clock, Lock
} from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import AppShell from '@/components/layout/AppShell'
import ProjectIntelligence from '@/components/projects/ProjectIntelligence'
import ProjectKnowledge from '@/components/projects/ProjectKnowledge'
import ProjectIssues from '@/components/projects/ProjectIssues'
import ProjectPipelines from '@/components/projects/ProjectPipelines'
import GitHubBadges from '@/components/projects/GitHubBadges'
import AutonomousADR from '@/components/projects/AutonomousADR'
import WebhookHelper from '@/components/projects/WebhookHelper'
import FeatureToggles from '@/components/projects/FeatureToggles'
import LivingActions from '@/components/projects/LivingActions'
import DevOpsHealthScore from '@/components/projects/DevOpsHealthScore'
import ProjectInfrastructure from '@/components/projects/ProjectInfrastructure'
import DeploymentHUD from '@/components/projects/DeploymentHUD'
import VercelBadge from '@/components/projects/VercelBadge'
import ProjectCredentials from '@/components/projects/ProjectCredentials'
import ProjectVitality from '@/components/dashboard/ProjectVitality'
import JournalFeed from '@/components/projects/JournalFeed'
import Tooltip from '@/components/ui/Tooltip'
import { type Project, type Log, type LogType, type Commit, STATUS_CONFIG, type ProjectStatus } from '@/lib/types'
import { getProjectById, updateProject, deleteProject, getLogsByProject, createLog, deleteLog } from '@/lib/queries'

import MarkdownContent from '@/components/ui/MarkdownContent'

const LOG_TYPES: { value: LogType; label: string; icon: string; color: string }[] = [
    { value: 'journal', label: 'Note', icon: '📝', color: 'var(--text-muted)' },
    { value: 'prochaine_etape', label: 'Feature/Roadmap', icon: '🚀', color: '#3B82F6' },
    { value: 'erreur_critique', label: 'Bug/Incident', icon: '🐞', color: '#EF4444' },
]

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Edit state
    const [editTitle, setEditTitle] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editStatus, setEditStatus] = useState<ProjectStatus>('idéation')
    const [editRepo, setEditRepo] = useState('')
    const [editDeploy, setEditDeploy] = useState('')
    const [editLocalPath, setEditLocalPath] = useState('')
    const [editVercelId, setEditVercelId] = useState('')
    const [editSupabaseUrl, setEditSupabaseUrl] = useState('')
    const [editSupabaseKey, setEditSupabaseKey] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    // Journal
    const [newLog, setNewLog] = useState('')
    const [logType, setLogType] = useState<LogType>('journal')
    const [showStatusMenu, setShowStatusMenu] = useState(false)

    // GitHub commits & README
    const [commits, setCommits] = useState<Commit[]>([])
    const [loadingCommits, setLoadingCommits] = useState(false)
    const [readmeContent, setReadmeContent] = useState('')
    const [generatingReadme, setGeneratingReadme] = useState(false)
    const [copiedReadme, setCopiedReadme] = useState(false)
    const [committingReadme, setCommittingReadme] = useState(false)
    const [isAIGenerated, setIsAIGenerated] = useState(false)
    const [workspaceContext, setWorkspaceContext] = useState<any>(null)
    const [loadingContext, setLoadingContext] = useState(false)
    const [generatingDescription, setGeneratingDescription] = useState(false)
    const [activeTab, setActiveTab] = useState('surveillance')

    const loadProject = useCallback(async () => {
        try {
            const data = await getProjectById(projectId)
            setProject(data)
            setEditTitle(data.title)
            setEditDesc(data.description || '')
            setEditStatus(data.status)
            setEditRepo(data.repo_url || '')
            setEditDeploy(data.deploy_url || '')
            setEditLocalPath(data.local_path || '')
            setEditVercelId(data.vercel_project_id || '')
            setEditSupabaseUrl(data.target_supabase_url || '')
            setEditSupabaseKey(data.target_supabase_anon_key || '')
            setTags(data.tags || [])
            setReadmeContent(data.readme_content || '')
        } catch (err) {
            console.error('Projet non trouvé:', err)
        }
    }, [projectId])

    const loadLogs = useCallback(async () => {
        try {
            const data = await getLogsByProject(projectId)
            setLogs(data)
        } catch (err) {
            console.error('Erreur logs:', err)
        }
    }, [projectId])

    const loadCommits = useCallback(async (repoName: string) => {
        setLoadingCommits(true)
        try {
            const res = await fetch(`/api/github/commits?repo=${encodeURIComponent(repoName)}`)
            if (res.ok) {
                const data = await res.json()
                setCommits(data)
            }
        } catch (err) {
            console.error('Erreur commits:', err)
        } finally {
            setLoadingCommits(false)
        }
    }, [])

    const loadWorkspaceContext = useCallback(async () => {
        if (!project?.github_repo_full_name || !project?.github_default_branch) return
        setLoadingContext(true)
        try {
            const wsRes = await fetch(`/api/github/workspace?repo=${project.github_repo_full_name}&branch=${project.github_default_branch}`)
            if (wsRes.ok) {
                const data = await wsRes.json()
                setWorkspaceContext(data.context)
            }
        } catch (err) {
            console.error('Error loading workspace context:', err)
        } finally {
            setLoadingContext(false)
        }
    }, [project])

    useEffect(() => {
        Promise.all([loadProject(), loadLogs()]).finally(() => setLoading(false))
    }, [loadProject, loadLogs])

    useEffect(() => {
        if (project) {
            loadWorkspaceContext()
        }
    }, [project, loadWorkspaceContext])

    const handleGenerateDescription = async () => {
        if (!readmeContent) {
            alert("Génère d'abord un README dans l'onglet Intelligence pour que l'IA puisse s'en inspirer !")
            return
        }
        setGeneratingDescription(true)
        try {
            const res = await fetch('/api/ai/describe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ readmeContent })
            })
            if (res.ok) {
                const { description } = await res.json()
                setEditDesc(description)
            }
        } catch (err) {
            console.error('Failed to generate description', err)
        } finally {
            setGeneratingDescription(false)
        }
    }

    const handleGenerateReadme = useCallback(async () => {
        setGeneratingReadme(true)
        setIsAIGenerated(false)
        try {
            // 1. Fetch Workspace Context if repo exists
            let workspaceContext = null
            if (project?.github_repo_full_name && project?.github_default_branch) {
                const wsRes = await fetch(`/api/github/workspace?repo=${project.github_repo_full_name}&branch=${project.github_default_branch}`)
                if (wsRes.ok) {
                    workspaceContext = (await wsRes.json()).context
                }
            }

            // 2. Generate via AI
            const res = await fetch('/api/readme/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDesc,
                    status: editStatus,
                    repoUrl: editRepo,
                    deployUrl: editDeploy,
                    workspaceContext
                }),
            })
            if (res.ok) {
                const { readme, isFallback } = await res.json()
                setReadmeContent(readme)
                setIsAIGenerated(!isFallback)
                await updateProject(projectId, { readme_content: readme })
            }
        } catch (err) {
            console.error('Erreur README:', err)
        } finally {
            setGeneratingReadme(false)
        }
    }, [project, editTitle, editDesc, editStatus, editRepo, editDeploy, projectId])

    useEffect(() => {
        if (project?.github_repo_full_name) {
            loadCommits(project.github_repo_full_name)
        }
        if (project?.readme_content) {
            setReadmeContent(project.readme_content)
        } else if (project && !generatingReadme && !readmeContent) {
            // AUTO-GENERATE README if missing
            console.log('Auto-generating missing README...')
            handleGenerateReadme()
        }
    }, [project, loadCommits, generatingReadme, readmeContent, handleGenerateReadme])

    const handleCommitReadme = async () => {
        if (!project?.github_repo_full_name) return
        if (!confirm('Voulez-vous pousser ce README directement sur la branche principale de GitHub ?')) return

        setCommittingReadme(true)
        try {
            const res = await fetch('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoFullName: project.github_repo_full_name,
                    branch: project.github_default_branch || 'main',
                    filePath: 'README.md',
                    content: readmeContent,
                    commitMessage: 'docs: update project documentation via Nexus Engineering'
                }),
            })

            if (res.ok) {
                alert('README.md mis à jour avec succès sur GitHub ! 🚀')
            } else {
                const err = await res.json()
                throw new Error(err.error || 'Erreur lors du commit')
            }
        } catch (err) {
            console.error('Erreur commit GitHub:', err)
            alert(`Erreur : ${err instanceof Error ? err.message : 'Impossible de pousser sur GitHub'}`)
        } finally {
            setCommittingReadme(false)
        }
    }

    const handleAddTag = () => {
        if (!tagInput.trim()) return
        if (tags.includes(tagInput.trim())) return
        setTags([...tags, tagInput.trim()])
        setTagInput('')
    }

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleCopyReadme = () => {
        navigator.clipboard.writeText(readmeContent)
        setCopiedReadme(true)
        setTimeout(() => setCopiedReadme(false), 2000)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateProject(projectId, {
                title: editTitle,
                description: editDesc || null,
                status: editStatus,
                repo_url: editRepo || null,
                deploy_url: editDeploy || null,
                local_path: editLocalPath || null,
                vercel_project_id: editVercelId || null,
                target_supabase_url: editSupabaseUrl || null,
                target_supabase_anon_key: editSupabaseKey || null,
                tags: tags,
            })
            await loadProject()
        } catch (err) {
            console.error('Erreur sauvegarde:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleAddLog = async () => {
        if (!newLog.trim()) return
        try {
            await createLog(projectId, newLog.trim(), logType)
            setNewLog('')
            await loadLogs()
        } catch (err) {
            console.error('Erreur ajout log:', err)
        }
    }

    const handleDeleteLog = async (logId: string) => {
        try {
            await deleteLog(logId)
            await loadLogs()
        } catch (err) {
            console.error('Erreur suppression log:', err)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Supprimer ce projet définitivement ?')) return
        try {
            await deleteProject(projectId)
            router.push('/projects')
        } catch (err) {
            console.error('Erreur suppression:', err)
        }
    }

    const handleStatusChange = async (newStatus: ProjectStatus) => {
        setEditStatus(newStatus)
        setShowStatusMenu(false)
        try {
            await updateProject(projectId, { status: newStatus })
            await loadProject()
        } catch (err) {
            console.error('Erreur changement statut:', err)
        }
    }

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-screen">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-4xl">⚡</motion.div>
                </div>
            </AppShell>
        )
    }

    if (!project) {
        return (
            <AppShell>
                <div className="flex flex-col items-center justify-center h-screen gap-4">
                    <div className="text-5xl">🫥</div>
                    <div style={{ color: 'var(--text-muted)' }}>Projet introuvable.</div>
                    <button onClick={() => router.push('/projects')} className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>
                        ← Retour aux projets
                    </button>
                </div>
            </AppShell>
        )
    }

    const config = STATUS_CONFIG[project.status]
    const capsuleLog = logs.find(l => l.log_type === 'prochaine_etape')

    return (
        <AppShell>
            <div className="w-full">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.push('/projects')} className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </button>
                    <div className="flex items-center gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: 'var(--gradient-vibe)', opacity: saving ? 0.6 : 1 }}>
                            <Save className="w-4 h-4" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </motion.button>
                        <button onClick={handleDelete} className="p-2 rounded-xl transition-colors hover:bg-red-50" style={{ color: 'var(--accent-red)' }}>
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* =========================================
                    TOP LEVEL / HERO SECTION
                   ========================================= */}
                <div className="mb-6 p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
                                    {config.label}
                                </span>
                                {project.is_zombie && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/10 text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" /> Zombie Project
                                    </span>
                                )}
                            </div>

                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="text-3xl font-black bg-transparent border-none outline-none w-full placeholder:opacity-20"
                                style={{ color: 'var(--text-primary)' }}
                                placeholder="Titre du Projet"
                            />

                            <div className="relative">
                                <textarea
                                    value={editDesc || ''}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="text-sm bg-transparent border-none outline-none w-full resize-none placeholder:opacity-20 leading-relaxed pr-10"
                                    style={{ color: 'var(--text-secondary)' }}
                                    placeholder="Description du projet..."
                                    rows={2}
                                />
                                <button
                                    onClick={handleGenerateDescription}
                                    disabled={generatingDescription || !readmeContent}
                                    className="absolute right-0 top-1 p-2 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-500/50 hover:text-indigo-500 transition-all disabled:opacity-0"
                                    title="Générer une description optimisée via IA"
                                >
                                    {generatingDescription ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs font-medium border border-gray-200 text-gray-500">
                                        #{tag}
                                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <div className="flex items-center gap-1">
                                    <input
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                        placeholder="+ Tag"
                                        className="w-16 bg-transparent border-none outline-none text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats / Capsule */}
                        <div className="shrink-0">
                            {capsuleLog && (
                                <div className="p-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 max-w-[280px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Prochaine Étape</span>
                                    </div>
                                    <p className="text-xs font-medium italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                        &ldquo;{capsuleLog.content}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* =========================================
                    TABS NAVIGATION
                   ========================================= */}
                <div className="flex items-center gap-1 mb-6 border-b border-gray-200 pb-px">
                    {[
                        {
                            id: 'surveillance', label: 'Surveillance', icon: Activity, color: 'text-emerald-500',
                            help: { title: 'Surveillance', description: 'Suivez l\'activité en temps réel de votre projet : issues GitHub, journal de bord, entrées de logs et état de santé global.', steps: ['Consultez les issues GitHub ouvertes', 'Ajoutez des entrées au journal de bord', 'Vérifiez le score de vitalité à droite'] }
                        },
                        {
                            id: 'intelligence', label: 'Intelligence', icon: Bot, color: 'text-purple-500',
                            help: { title: 'Intelligence IA', description: 'Analyse automatique du code source par l\'IA. Génère des insights, des résumés hebdomadaires et de la documentation.', steps: ['Lancez une analyse des commits', 'Consultez le résumé hebdomadaire', 'Générez un README avec l\'IA'] }
                        },
                        {
                            id: 'devops', label: 'DevOps & Infra', icon: Shield, color: 'text-indigo-500',
                            help: { title: 'DevOps & Infrastructure', description: 'Gérez l\'infrastructure technique : fichiers Docker, clés API, déploiements, pipelines CI/CD et scores de santé DevOps.', steps: ['Configurez vos fichiers d\'infrastructure', 'Stockez vos clés API en sécurité', 'Suivez les déploiements en temps réel'] }
                        },
                        {
                            id: 'params', label: 'Configuration', icon: Info, color: 'text-zinc-400',
                            help: { title: 'Configuration du Projet', description: 'Modifiez les paramètres du projet : statut, liens, tags, URL du dépôt et de déploiement.', steps: ['Changez le statut du projet', 'Ajoutez des tags pour organiser', 'Configurez les URLs GitHub et de déploiement'] }
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            //@ts-ignore
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                                //@ts-ignore
                                activeTab === tab.id
                                    ? 'text-foreground'
                                    : 'text-muted hover:text-secondary'
                                }`}
                        >
                            <tab.icon className={`w-3.5 h-3.5 ${tab.color}`} />
                            {tab.label}
                            {
                                //@ts-ignore
                                activeTab === tab.id && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                                )}
                        </button>
                    ))}
                    {/* Help tooltip for active tab */}
                    {(() => {
                        const tabs = [
                            { id: 'surveillance', help: { title: 'Surveillance', description: 'Suivez l\'activité en temps réel de votre projet.', steps: ['Consultez les issues GitHub ouvertes', 'Ajoutez des entrées au journal', 'Vérifiez le score de vitalité'] } },
                            { id: 'intelligence', help: { title: 'Intelligence IA', description: 'Analyse automatique du code source par l\'IA.', steps: ['Lancez une analyse des commits', 'Consultez le résumé hebdomadaire'] } },
                            { id: 'devops', help: { title: 'DevOps & Infrastructure', description: 'Infrastructure, clés API, déploiements et CI/CD.', steps: ['Configurez Docker', 'Stockez vos clés API', 'Suivez les déploiements'] } },
                            { id: 'params', help: { title: 'Configuration', description: 'Paramètres du projet : statut, liens, tags.', steps: ['Changez le statut', 'Ajoutez des tags', 'Configurez les URLs'] } },
                        ]
                        const active = tabs.find(t => t.id === activeTab)
                        return active ? <HelpTooltip title={active.help.title} description={active.help.description} steps={active.help.steps} /> : null
                    })()}
                </div>

                {/* =========================================
                    TAB CONTENT
                   ========================================= */}
                <div>
                    <AnimatePresence mode="wait">
                        {
                            //@ts-ignore
                            activeTab === 'surveillance' && (
                                <motion.div key="surveillance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                                    {/* LEFT : Journal & Activity (8/12) */}
                                    <div className="xl:col-span-8 space-y-6">
                                        <div className="rounded-3xl p-8 border border-gray-200 shadow-sm bg-white">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                        <Activity className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Surveillance</h3>
                                                        <p className="text-[10px] text-gray-400">PONT EN DIRECT & FLUX D'ACTIVITÉ</p>
                                                    </div>
                                                </div>
                                                <LivingActions
                                                    projectId={projectId}
                                                    repoUrl={project.repo_url}
                                                    deployUrl={project.deploy_url}
                                                />
                                            </div>

                                            {project.github_repo_full_name && (
                                                <div className="mb-10 rounded-2xl p-6 border border-gray-200 bg-gray-50">
                                                    <ProjectIssues repoFullName={project.github_repo_full_name} />
                                                </div>
                                            )}

                                            <div className="space-y-10">
                                                {/* Log Entry Form */}
                                                <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex gap-2">
                                                            {LOG_TYPES.map((lt) => (
                                                                <button key={lt.value} onClick={() => setLogType(lt.value)}
                                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${logType === lt.value ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-700'}`}>
                                                                    {lt.icon} {lt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] font-mono text-gray-400 uppercase">Entrée Journal</span>
                                                    </div>
                                                    <textarea
                                                        value={newLog} onChange={(e) => setNewLog(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddLog())}
                                                        placeholder={
                                                            logType === 'prochaine_etape' ? 'Décris la nouvelle feature ou l\'étape de roadmap...' :
                                                                logType === 'erreur_critique' ? 'Analyse du bug ou de l\'incident...' :
                                                                    'Note technique, observation, décision d\'architecture...'
                                                        }
                                                        rows={3}
                                                        className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 resize-none font-medium mb-4"
                                                    />
                                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                            <Clock className="w-3 h-3" /> Shift+Enter lance la publication
                                                        </p>
                                                        <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddLog}
                                                            className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-md">
                                                            PUBLIER
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                <JournalFeed
                                                    logs={logs}
                                                    onDelete={handleDeleteLog}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT : Santé & Status (4/12) */}
                                    <div className="xl:col-span-4 space-y-8">
                                        <div className="rounded-3xl p-8 border border-gray-200 shadow-sm bg-white">
                                            <ProjectVitality updatedAt={project.updated_at} commitsCount={commits.length} logsCount={logs.length} techDebtScore={project.tech_debt_score} />
                                        </div>

                                        <div className="rounded-3xl p-8 border border-gray-200 shadow-sm bg-white">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <GitCommit className="w-5 h-5 text-purple-500" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Historique Commits</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {commits.length > 0 && <span className="text-[10px] font-mono text-purple-500">{commits.length} ÉLÉMENTS</span>}
                                                    <button
                                                        onClick={() => project.github_repo_full_name && loadCommits(project.github_repo_full_name)}
                                                        disabled={loadingCommits}
                                                        className="p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-purple-500 transition-all disabled:opacity-50"
                                                    >
                                                        <RefreshCw className={`w-3.5 h-3.5 ${loadingCommits ? 'animate-spin' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>
                                            {loadingCommits ? (
                                                <div className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-700" /></div>
                                            ) : commits.length === 0 ? (
                                                <p className="text-[10px] text-center font-bold text-gray-400 uppercase py-6">Aucun commit</p>
                                            ) : (
                                                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pt-2">
                                                    {commits.slice(0, 15).map((c) => (
                                                        <motion.a
                                                            key={c.sha}
                                                            href={c.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            whileHover={{ x: 4 }}
                                                            className="block p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white transition-all group"
                                                        >
                                                            <div className="text-xs font-bold leading-tight mb-2 text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-2">{c.message}</div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[9px] font-black uppercase text-gray-500">{c.author_name}</span>
                                                                <code className="text-[9px] text-purple-400 font-bold bg-purple-500/5 px-2 py-0.5 rounded-lg border border-purple-500/10">{c.sha.slice(0, 7)}</code>
                                                            </div>
                                                        </motion.a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        }

                        {
                            //@ts-ignore
                            activeTab === 'intelligence' && (
                                <motion.div key="intelligence" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="rounded-2xl p-6 border border-gray-200 shadow-sm bg-white">
                                        <ProjectIntelligence project={project} />
                                    </div>

                                    <div className="rounded-2xl p-6 border border-gray-200 shadow-sm bg-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-indigo-500" /> Documentation Générative
                                            </h3>
                                            {readmeContent && (
                                                <button onClick={handleCopyReadme} className="p-2 rounded-xl transition-colors hover:bg-zinc-100 hover:text-emerald-500 border" style={{ borderColor: 'var(--border-subtle)' }}>
                                                    {copiedReadme ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex gap-3 mb-6">
                                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleGenerateReadme} disabled={generatingReadme}
                                                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 bg-indigo-500 shadow-md">
                                                {generatingReadme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                                {readmeContent ? 'Régénérer README' : 'Générer README (IA)'}
                                            </motion.button>

                                            {readmeContent && project.github_repo_full_name && (
                                                <motion.button whileTap={{ scale: 0.95 }} onClick={handleCommitReadme} disabled={committingReadme}
                                                    className="px-6 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 hover:bg-zinc-50 transition-colors"
                                                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                                                    {committingReadme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Pousser via Commit
                                                </motion.button>
                                            )}
                                        </div>

                                        {readmeContent && (
                                            <pre className="text-xs p-5 rounded-2xl overflow-y-auto max-h-screen font-mono border border-gray-200 bg-gray-50 text-gray-600">
                                                {readmeContent}
                                            </pre>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                        {
                            //@ts-ignore
                            activeTab === 'devops' && (
                                <motion.div key="devops" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-8 space-y-6">
                                        <div className="rounded-2xl p-6 border border-gray-200 shadow-sm bg-white">
                                            <ProjectInfrastructure project={project} workspaceContext={workspaceContext} />
                                        </div>

                                        <div className="rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 bg-white">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500" /> État des Déploiements</h3>
                                            <VercelBadge projectId={project.vercel_project_id} />
                                            {project.github_repo_full_name && <DeploymentHUD repoFullName={project.github_repo_full_name} />}
                                            {project.github_repo_full_name && <GitHubBadges repoFullName={project.github_repo_full_name} defaultBranch={project.github_default_branch || 'main'} />}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="rounded-3xl border border-gray-200 shadow-sm bg-white">
                                            <ProjectCredentials
                                                projectId={projectId}
                                                initialUrl={editSupabaseUrl}
                                                initialKey={editSupabaseKey}
                                                initialVercelId={editVercelId}
                                                onRefresh={loadProject}
                                            />
                                        </div>
                                        <AutonomousADR projectTitle={project.title} logs={logs} commits={commits} />
                                    </div>
                                </motion.div>
                            )}

                        {
                            //@ts-ignore
                            activeTab === 'params' && (
                                <motion.div key="params" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="rounded-2xl p-6 border border-gray-200 shadow-sm bg-white">
                                            <ProjectKnowledge projectId={projectId} workspaceContext={workspaceContext} />
                                        </div>
                                        <WebhookHelper projectId={projectId} />
                                    </div>
                                    <div className="space-y-6">
                                        <div className="rounded-2xl p-6 border border-gray-200 shadow-sm bg-white">
                                            <div>
                                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Configuration Locale</h3>
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Workspace Local</label>
                                                <input type="text" value={editLocalPath} onChange={(e) => setEditLocalPath(e.target.value)}
                                                    placeholder="C:\Users\..."
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-mono outline-none focus:border-emerald-400 text-gray-900" />
                                                <p className="text-[9px] mt-2 text-gray-400 font-bold uppercase">Requis pour VS Code & Explorer</p>
                                            </div>
                                        </div>
                                        <FeatureToggles flags={project.feature_flags} onSave={(newFlags) => updateProject(projectId, { feature_flags: newFlags })} />
                                    </div>
                                </motion.div>
                            )}
                    </AnimatePresence>
                </div >
            </div >
        </AppShell >
    )
}
