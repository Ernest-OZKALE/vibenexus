'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Search, FolderKanban, Github } from 'lucide-react'
import RepoImporter from '@/components/projects/RepoImporter'
import AppShell from '@/components/layout/AppShell'
import ProjectCard from '@/components/dashboard/ProjectCard'
import { type Project, type ProjectStatus } from '@/lib/types'
import { getProjects, createProject } from '@/lib/queries'

export default function ProjectsPage() {
    const router = useRouter()
    const [projects, setProjects] = useState<Project[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all' | 'connected'>('all')
    const [showNewModal, setShowNewModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newDesc, setNewDesc] = useState('')
    const [loading, setLoading] = useState(true)

    const loadProjects = useCallback(async () => {
        try {
            const data = await getProjects()
            setProjects(data)
        } catch (err) {
            console.error('Erreur chargement projets:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadProjects() }, [loadProjects])

    const filtered = projects
        .filter(p => {
            if (statusFilter === 'all') return true
            if (statusFilter === 'connected') return !!p.github_repo_full_name
            return p.status === statusFilter
        })
        .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleCreate = async () => {
        if (!newTitle.trim()) return
        try {
            await createProject(newTitle.trim(), newDesc.trim() || undefined)
            setNewTitle('')
            setNewDesc('')
            setShowNewModal(false)
            await loadProjects()
        } catch (err) {
            console.error('Erreur création:', err)
        }
    }

    return (
        <AppShell>
            <div className="w-full px-6 sm:px-12 xl:px-24 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                <FolderKanban className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                Hub des Projets
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-zinc-500 max-w-xl">
                            Espace de gestion. Vous pilotez actuellement <strong className="text-indigo-500">{projects.length} initiatives</strong> (création, refactorisation, ou maintenance).
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-zinc-800"
                            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                        >
                            <Github className="w-4 h-4" /> Importer de GitHub
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNewModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-500/20" style={{ background: 'var(--gradient-vibe)' }}>
                            <Plus className="w-4 h-4" /> Nouveau Projet
                        </motion.button>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 max-w-lg relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input type="text" placeholder="Rechercher un projet par nom ou focus..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-indigo-500/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                        className="px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <option value="all">Tous les statuts</option>
                        <option value="vibecoding">🔥 En plein Vibe</option>
                        <option value="stable">🛰️ Stable</option>
                        <option value="hibernation">❄️ Hibernation</option>
                        <option value="idéation">💡 Idéation</option>
                        <option value="cimetière">🪦 Cimetière</option>
                        <option value="connected">🔗 Connectés GitHub</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-4xl inline-block">⚡</motion.div>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
                        {filtered.map((project) => (
                            <ProjectCard key={project.id} id={project.id} title={project.title} description={project.description}
                                status={project.status} techDebtScore={project.tech_debt_score} repoUrl={project.repo_url}
                                deployUrl={project.deploy_url} updatedAt={project.updated_at}
                                tags={project.tags}
                                onClick={() => router.push(`/projects/${project.id}`)} />
                        ))}
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🔍</div>
                        <p style={{ color: 'var(--text-muted)' }}>Aucun projet trouvé.</p>
                    </div>
                )}

                {showNewModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowNewModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>⚡ Nouveau Projet</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Nom du projet</label>
                                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Mon app incroyable..."
                                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                                    <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="À quoi ça sert ? (en une phrase)" rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-elevated"
                                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>Annuler</button>
                                    <button onClick={handleCreate} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-500/20"
                                        style={{ background: 'var(--gradient-vibe)' }}>Créer 🚀</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                <RepoImporter
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={loadProjects}
                />
            </div>
        </AppShell>
    )
}
