'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Code2, Copy, Check, Plus, Search, Trash2 } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { type Component } from '@/lib/types'
import { getComponents, createComponent, deleteComponent } from '@/lib/queries'

export default function ComponentsPage() {
    const [snippets, setSnippets] = useState<Component[]>([])
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newCode, setNewCode] = useState('')
    const [newLang, setNewLang] = useState('typescript')

    const loadSnippets = useCallback(async () => {
        try {
            const data = await getComponents()
            setSnippets(data)
        } catch (err) {
            console.error('Erreur chargement snippets:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadSnippets() }, [loadSnippets])

    const handleCopy = (id: string, code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleCreate = async () => {
        if (!newTitle.trim() || !newCode.trim()) return
        try {
            await createComponent(newTitle.trim(), newCode, newLang)
            setNewTitle(''); setNewCode(''); setShowModal(false)
            await loadSnippets()
        } catch (err) {
            console.error('Erreur création:', err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteComponent(id)
            setSnippets(snippets.filter(s => s.id !== id))
        } catch (err) {
            console.error('Erreur suppression:', err)
        }
    }

    const filtered = snippets.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code_snippet.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AppShell>
            <div className="w-full px-6 sm:px-12 xl:px-24 py-10">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🧱 Boutique de Snippets</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tes briques de code réutilisables.</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--gradient-vibe)' }}>
                        <Plus className="w-4 h-4" /> Ajouter
                    </motion.button>
                </motion.div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input type="text" placeholder="Rechercher un snippet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm" style={{ color: 'var(--text-primary)' }} />
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-4xl inline-block">⚡</motion.div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((snippet) => (
                            <motion.div key={snippet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <div className="flex items-center gap-3">
                                        <Code2 className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{snippet.title}</span>
                                        {snippet.language && (
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                                                {snippet.language}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleCopy(snippet.id, snippet.code_snippet)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                                            {copiedId === snippet.id ? <Check className="w-4 h-4" style={{ color: '#22C55E' }} /> : <Copy className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                                        </button>
                                        <button onClick={() => handleDelete(snippet.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                        </button>
                                    </div>
                                </div>
                                <pre className="p-5 text-sm overflow-x-auto font-mono leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    <code>{snippet.code_snippet}</code>
                                </pre>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && snippets.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🧱</div>
                        <p style={{ color: 'var(--text-muted)' }}>Aucun snippet encore. Commence à sauvegarder tes briques de code !</p>
                    </div>
                )}

                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg rounded-2xl p-6 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🧱 Nouveau Snippet</h2>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Titre</label>
                                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Supabase Auth Hook"
                                            className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                                            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                                    </div>
                                    <div className="w-32">
                                        <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Langage</label>
                                        <select value={newLang} onChange={(e) => setNewLang(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                                            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                            <option>typescript</option><option>javascript</option><option>python</option><option>sql</option><option>css</option><option>html</option><option>bash</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Code</label>
                                    <textarea value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Colle ton code ici..." rows={8}
                                        className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none font-mono"
                                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border"
                                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>Annuler</button>
                                    <button onClick={handleCreate} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                                        style={{ background: 'var(--gradient-vibe)' }}>Sauvegarder 💾</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </AppShell>
    )
}
