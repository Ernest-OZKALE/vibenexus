'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Search, Check, Loader2, X, AlertCircle, PlusCircle, ArrowRight } from 'lucide-react'

interface Repo {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    default_branch: string
    language: string | null
    stars: number
    updated_at: string
    already_imported: boolean
}

interface RepoImporterProps {
    isOpen: boolean
    onClose: () => void
    onImportSuccess: () => void
}

export default function RepoImporter({ isOpen, onClose, onImportSuccess }: RepoImporterProps) {
    const [repos, setRepos] = useState<Repo[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRepos, setSelectedRepos] = useState<Repo[]>([])
    const [importing, setImporting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            loadRepos()
        }
    }, [isOpen])

    const loadRepos = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/github/repos')
            if (!res.ok) throw new Error('Échec du chargement des dépôts')
            const data = await res.json()
            setRepos(Array.isArray(data) ? data : [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleSelection = (repo: Repo) => {
        if (repo.already_imported) return
        if (selectedRepos.find(r => r.id === repo.id)) {
            setSelectedRepos(selectedRepos.filter(r => r.id !== repo.id))
        } else {
            setSelectedRepos([...selectedRepos, repo])
        }
    }

    const handleImport = async () => {
        if (selectedRepos.length === 0) return
        setImporting(true)
        try {
            const res = await fetch('/api/github/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repos: selectedRepos })
            })
            if (!res.ok) throw new Error('Échec de l\'importation')
            onImportSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setImporting(false)
        }
    }

    const filteredRepos = repos.filter(r =>
        r.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                >
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                                <Github className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    Importation Massive
                                </h2>
                                <p className="text-xs text-zinc-500">Connectez vos dépôts GitHub au Nexus en un clic.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>

                    {/* Search & Stats */}
                    <div className="p-6 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Rechercher un dépôt..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all focus:border-indigo-500/50"
                                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                                {loading ? 'Chargement...' : `${filteredRepos.length} dépôts trouvés`}
                            </span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500">
                                {selectedRepos.length} sélectionné(s)
                            </span>
                        </div>
                    </div>

                    {/* Repo List */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 custom-scrollbar">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-20 rounded-2xl border border-dashed animate-pulse" style={{ borderColor: 'var(--border-subtle)' }} />
                            ))
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-rose-500">
                                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold">{error}</p>
                                <button onClick={loadRepos} className="mt-4 text-xs underline">Réessayer</button>
                            </div>
                        ) : filteredRepos.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <p className="text-sm">Aucun dépôt trouvé.</p>
                            </div>
                        ) : (
                            filteredRepos.map(repo => (
                                <button
                                    key={repo.id}
                                    onClick={() => toggleSelection(repo)}
                                    disabled={repo.already_imported}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedRepos.find(r => r.id === repo.id)
                                        ? 'border-emerald-300 bg-emerald-50'
                                        : repo.already_imported
                                            ? 'opacity-40 grayscale cursor-not-allowed'
                                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedRepos.find(r => r.id === repo.id) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                                            }`} style={{ borderColor: 'var(--border-subtle)' }}>
                                            {selectedRepos.find(r => r.id === repo.id) ? <Check className="w-5 h-5" /> : <Github className="w-5 h-5" />}
                                        </div>
                                        <div className="max-w-[300px]">
                                            <p className="text-sm font-bold text-gray-900 truncate">{repo.name}</p>
                                            <p className="text-[10px] text-zinc-500 truncate">{repo.description || 'Pas de description.'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {repo.already_imported ? (
                                            <span className="text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded bg-gray-100 text-gray-500">
                                                Déjà au Nexus
                                            </span>
                                        ) : (
                                            <div className="text-right">
                                                <p className="text-[10px] font-mono text-zinc-500">{repo.language || 'Global'}</p>
                                                <p className="text-[10px] text-zinc-600">★ {repo.stars}</p>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                        <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            Plus tard
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={selectedRepos.length === 0 || importing}
                            className="flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'var(--gradient-vibe)', color: 'white' }}
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importation...
                                </>
                            ) : (
                                <>
                                    Importer au Nexus
                                    <PlusCircle className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
