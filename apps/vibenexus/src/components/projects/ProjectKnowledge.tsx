'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, Plus, Trash2, Tag, Loader2, Sparkles, X, Search, MessageSquare } from 'lucide-react'
import { getProjectKnowledge, createProjectKnowledge, deleteProjectKnowledge } from '@/lib/queries'

interface Knowledge {
    id: string
    title: string
    content: string
    category: string
    created_at: string
}

interface ProjectKnowledgeProps {
    projectId: string
    workspaceContext?: any
}

export default function ProjectKnowledge({ projectId, workspaceContext }: ProjectKnowledgeProps) {
    const [knowledge, setKnowledge] = useState<Knowledge[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [category, setCategory] = useState('architecture')
    const [isSaving, setIsSaving] = useState(false)
    const [isAutoSensing, setIsAutoSensing] = useState(false)

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchAnswer, setSearchAnswer] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        loadKnowledge()
    }, [projectId])

    useEffect(() => {
        if (!loading && knowledge.length === 0 && workspaceContext && !isAutoSensing) {
            handleAutoSense()
        }
    }, [loading, knowledge.length, workspaceContext])

    const loadKnowledge = async () => {
        setLoading(true)
        try {
            const data = await getProjectKnowledge(projectId)
            setKnowledge(data)
        } catch (error) {
            console.error('Error loading knowledge:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !content) return

        setIsSaving(true)
        try {
            await createProjectKnowledge(projectId, title, content, category)
            setTitle('')
            setContent('')
            setCategory('architecture')
            setShowForm(false)
            await loadKnowledge()
        } catch (error) {
            console.error('Error saving knowledge:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Supprimer cette fiche de connaissance ?')) return
        try {
            await deleteProjectKnowledge(id)
            await loadKnowledge()
        } catch (error) {
            console.error('Error deleting knowledge:', error)
        }
    }
    const handleAutoSense = async () => {
        if (!workspaceContext) {
            console.warn('Auto-Sense: No workspace context available')
            return
        }
        setIsAutoSensing(true)
        try {
            console.log('Auto-Sense: Starting AI analysis...')
            const res = await fetch('/api/ai/knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceContext })
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Erreur API AI')
            }

            const { cards } = await res.json()
            console.log('Auto-Sense: AI generated cards:', cards)

            if (!cards || cards.length === 0) {
                throw new Error('L\'IA n\'a pas généré de cartes pour ce projet.')
            }

            for (const card of cards) {
                await createProjectKnowledge(projectId, card.title, card.content, card.category)
            }
            await loadKnowledge()
        } catch (error: any) {
            console.error('Error in Auto-Sense:', error)
            alert(`Auto-Sense a échoué : ${error.message}`)
        } finally {
            setIsAutoSensing(false)
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        setSearchAnswer(null)
        try {
            const res = await fetch('/api/ai/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, projectId })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setSearchAnswer(data.answer)
        } catch (error: any) {
            console.error('Search error:', error)
            setSearchAnswer(`Erreur : ${error.message}`)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                        <Book className="w-4 h-4 text-emerald-500" /> Base de Connaissances
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Injection de contexte pour l&apos;IA</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAutoSense}
                        disabled={isAutoSensing || !workspaceContext}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-tighter ${!workspaceContext
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                        title={!workspaceContext ? "GitHub non configuré ou contexte manquant" : "Analyse automatique du code"}
                    >
                        {isAutoSensing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Auto-Sense
                    </button>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Semantic Search Bar */}
            <div className="relative group">
                <form onSubmit={handleSearch} className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-emerald-400 transition-all">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher dans la base de connaissances..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent text-xs outline-none py-1 placeholder:text-gray-400 text-gray-900"
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-100 disabled:opacity-30 transition-all border border-emerald-200"
                    >
                        {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Rechercher'}
                    </button>
                </form>

                <AnimatePresence>
                    {searchAnswer && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border border-emerald-200 bg-white shadow-lg z-20 space-y-2 max-h-[300px] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                                    <MessageSquare className="w-3 h-3" /> Résultat
                                </span>
                                <button onClick={() => setSearchAnswer(null)} className="text-gray-400 hover:text-gray-700">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="text-xs leading-relaxed text-gray-700">
                                {searchAnswer}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSave}
                        className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Nouvelle Fiche
                            </span>
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Titre (ex: Règles métier API)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400 text-gray-900"
                        />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-400 text-gray-700"
                        >
                            <option value="architecture">Architecture</option>
                            <option value="logic">Logique Code</option>
                            <option value="business">Règles Métier</option>
                            <option value="devops">DevOps / Infra</option>
                        </select>
                        <textarea
                            placeholder="Contenu technique ou métier..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none text-gray-900"
                        />
                        <button
                            type="submit"
                            disabled={isSaving || !title || !content}
                            className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            Ajouter une fiche
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                ) : knowledge.length === 0 ? (
                    <div className="text-center py-6 px-4 border border-dashed border-gray-300 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-gray-500">À quoi sert cette base ?</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed text-left">
                            Stockez ici les règles de nommage, l'architecture métier, ou vos choix techno. L'IA lira automatiquement ces fiches avant d'intervenir sur ce projet afin de respecter <strong>vos standards</strong>.
                        </p>
                        <p className="text-[10px] text-emerald-600 italic mt-2">Cliquez sur le '+' pour ajouter votre première règle.</p>
                    </div>
                ) : (
                    knowledge.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="p-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all cursor-pointer group shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold truncate text-gray-900 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex items-center gap-1">
                                            <Tag className="w-2.5 h-2.5" /> {item.category}
                                        </span>
                                        <span className="text-[9px] text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="p-1 px-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <AnimatePresence>
                                {expandedId === item.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 pt-3 border-t border-dashed border-gray-200 overflow-hidden"
                                    >
                                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                                            {item.content}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
