'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Github, Download, CheckCircle, Lock, Globe, Star, Search,
} from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import AppShell from '@/components/layout/AppShell'
import { createProject, updateProject } from '@/lib/queries'

interface GitHubRepo {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    default_branch: string
    language: string | null
    stars: number
    updated_at: string
    pushed_at: string
    is_private: boolean
    already_imported: boolean
}

const LANG_COLORS: Record<string, string> = {
    TypeScript: '#3178C6', JavaScript: '#F1E05A', Python: '#3572A5',
    HTML: '#E34C26', CSS: '#563D7C', Java: '#B07219', Go: '#00ADD8',
    Rust: '#DEA584', C: '#555555', 'C++': '#F34B7D', 'C#': '#178600',
    PHP: '#4F5D95', Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF',
    Dart: '#00B4AB', Shell: '#89E051', Vue: '#41B883',
}

export default function GitHubSyncPage() {
    const router = useRouter()
    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [importing, setImporting] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'all' | 'not_imported'>('not_imported')

    const loadRepos = useCallback(async () => {
        try {
            const res = await fetch('/api/github/repos')
            if (res.status === 401) {
                setError('not_connected')
                setLoading(false)
                return
            }
            if (!res.ok) throw new Error('Erreur API')
            const data = await res.json()
            setRepos(data)
        } catch (err) {
            console.error(err)
            setError('api_error')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadRepos() }, [loadRepos])

    const handleImport = async (repo: GitHubRepo) => {
        setImporting(repo.full_name)
        try {
            const project = await createProject(repo.name, repo.description || undefined)
            await updateProject(project.id, {
                repo_url: repo.html_url,
                github_repo_full_name: repo.full_name,
                github_default_branch: repo.default_branch,
                status: 'stable',
            })
            // Mark as imported locally
            setRepos(repos.map(r =>
                r.full_name === repo.full_name ? { ...r, already_imported: true } : r
            ))
        } catch (err) {
            console.error('Import error:', err)
        } finally {
            setImporting(null)
        }
    }

    const filtered = repos
        .filter(r => filter === 'all' || !r.already_imported)
        .filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )

    if (error === 'not_connected') {
        return (
            <AppShell>
                <div className="w-full px-6 sm:px-12 xl:px-24 py-20 text-center">
                    <div className="text-6xl mb-6">🔐</div>
                    <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Connexion GitHub requise</h1>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                        Connecte-toi avec ton compte GitHub pour synchroniser tes repos.
                    </p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/login')}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#24292F' }}>
                        <Github className="w-5 h-5" /> Se connecter avec GitHub
                    </motion.button>
                </div>
            </AppShell>
        )
    }

    return (
        <AppShell>
            <div className="w-full px-6 sm:px-12 xl:px-24 py-10">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Github className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Synchronisation GitHub</h1>
                        <HelpTooltip
                            title="Synchronisation GitHub"
                            description="Importez vos dépôts GitHub comme projets Nexus. Les commits, README et métadonnées sont automatiquement synchronisés."
                            steps={['Connectez votre compte GitHub si ce n\'est pas encore fait', 'Parcourez la liste de vos dépôts', 'Cliquez sur Importer pour ajouter un dépôt comme projet', 'Le projet apparaîtra automatiquement dans votre tableau de bord']}
                        />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Importez vos dépôts GitHub comme projets Nexus. Commits et README synchronisés.
                    </p>
                </motion.div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Rechercher un repo..." value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--text-primary)' }} />
                    </div>
                    <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-subtle)' }}>
                        {(['not_imported', 'all'] as const).map((f) => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="px-4 py-2.5 text-xs font-medium transition-colors"
                                style={{
                                    background: filter === f ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-card)',
                                    color: filter === f ? 'var(--accent-green)' : 'var(--text-muted)',
                                }}>
                                {f === 'not_imported' ? 'Non importés' : 'Tous'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 mb-6">
                    <div className="px-4 py-2 rounded-xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        📦 <strong>{repos.length}</strong> repos
                    </div>
                    <div className="px-4 py-2 rounded-xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        ✅ <strong>{repos.filter(r => r.already_imported).length}</strong> importés
                    </div>
                    <div className="px-4 py-2 rounded-xl border text-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        🆕 <strong>{repos.filter(r => !r.already_imported).length}</strong> à importer
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-4xl inline-block">⚡</motion.div>
                        <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>Chargement des repos GitHub...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {filtered.map((repo) => (
                                <motion.div key={repo.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }} layout
                                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm"
                                    style={{ background: 'var(--bg-card)', borderColor: repo.already_imported ? 'rgba(22,163,74,0.2)' : 'var(--border-subtle)' }}>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {repo.is_private ? (
                                                <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                            ) : (
                                                <Globe className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                            )}
                                            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{repo.name}</span>
                                            {repo.language && (
                                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: LANG_COLORS[repo.language] || '#888' }} />
                                                    {repo.language}
                                                </span>
                                            )}
                                            {repo.stars > 0 && (
                                                <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <Star className="w-3 h-3" /> {repo.stars}
                                                </span>
                                            )}
                                        </div>
                                        {repo.description && (
                                            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{repo.description}</p>
                                        )}
                                    </div>
                                    {/* Action */}
                                    {repo.already_imported ? (
                                        <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                                            style={{ background: 'rgba(22,163,74,0.08)', color: 'var(--accent-green)' }}>
                                            <CheckCircle className="w-3.5 h-3.5" /> Importé
                                        </span>
                                    ) : (
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleImport(repo)}
                                            disabled={importing === repo.full_name}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                                            style={{ background: 'var(--gradient-vibe)', opacity: importing === repo.full_name ? 0.6 : 1 }}>
                                            <Download className="w-3.5 h-3.5" />
                                            {importing === repo.full_name ? 'Import...' : 'Importer'}
                                        </motion.button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🎉</div>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {filter === 'not_imported' ? 'Tous tes repos sont déjà importés !' : 'Aucun repo trouvé.'}
                        </p>
                    </div>
                )}
            </div>
        </AppShell>
    )
}
