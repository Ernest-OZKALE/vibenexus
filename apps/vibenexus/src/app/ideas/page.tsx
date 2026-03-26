'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import AppShell from '@/components/layout/AppShell'
import IdeaADR from '@/components/ideas/IdeaADR'
import InnovationAudit from '@/components/ideas/InnovationAudit'
import { type Idea, type IdeaStatus } from '@/lib/types'
import { getIdeas, createIdea, deleteIdea, convertIdeaToProject } from '@/lib/queries'

const STATUS_COLORS: Record<IdeaStatus, { bg: string; text: string; label: string }> = {
    'brut': { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', label: '✨ Brut' },
    'validé': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', label: '✅ Validé' },
    'rejeté': { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', label: '❌ Rejeté' },
    'converti_en_projet': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', label: '🚀 Converti' },
}

export default function IdeasPage() {
    const router = useRouter()
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [newIdea, setNewIdea] = useState('')
    const [loading, setLoading] = useState(true)

    const loadIdeas = useCallback(async () => {
        try {
            const data = await getIdeas()
            setIdeas(data)
        } catch (err) {
            console.error('Erreur chargement idées:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadIdeas() }, [loadIdeas])

    const handleAddIdea = async () => {
        if (!newIdea.trim()) return
        try {
            await createIdea(newIdea.trim())
            setNewIdea('')
            await loadIdeas()
        } catch (err) {
            console.error('Erreur ajout idée:', err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteIdea(id)
            setIdeas(ideas.filter(i => i.id !== id))
        } catch (err) {
            console.error('Erreur suppression:', err)
        }
    }

    const handleConvertToProject = async (idea: Idea) => {
        if (!confirm('Voulez-vous transformer cette idée en un projet actif ?')) return
        try {
            const project = await convertIdeaToProject(idea.id, idea.content.substring(0, 50))
            await loadIdeas()
            // Optional: redirect to project or show success
            if (confirm('Idée convertie ! Voulez-vous voir le nouveau projet ?')) {
                router.push(`/projects/${project.id}`)
            }
        } catch (err) {
            console.error('Erreur conversion:', err)
        }
    }

    return (
        <AppShell>
            <div className="w-full px-6 sm:px-12 xl:px-24 py-10">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>🔬 Labo d'Innovation</h1>
                        <HelpTooltip
                            title="Labo d'Innovation"
                            description="Espace de créativité pour capturer vos idées brutes et les transformer en spécifications techniques. L'IA analyse la faisabilité et génère des architectures."
                            steps={['Décrivez votre idée dans le champ de saisie', 'Utilisez les modèles rapides pour démarrer', 'Cliquez sur Audit IA pour analyser la faisabilité', 'Générez un ADR pour obtenir les spécifications', 'Convertissez en projet quand l\'idée est validée']}
                        />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Transforme tes idées brutes en spécifications techniques de classe mondiale.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8 space-y-4">
                    <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-none">
                        {['🤖 Un SaaS IA pour...', '📱 Une app mobile qui...', '🛠️ Un outil dev pour...', '💡 Un plugin qui...'].map((template) => (
                            <button
                                key={template}
                                onClick={() => setNewIdea(template)}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full border text-xs font-medium hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                            >
                                {template}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl border focus-within:border-purple-500/50 transition-colors shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-purple)' }} />
                        <input type="text" value={newIdea} onChange={(e) => setNewIdea(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
                            placeholder="Décris ton idée (ex: Un outil pour automatiser la gestion des serveurs Discord...)"
                            className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500" style={{ color: 'var(--text-primary)' }} />
                        {newIdea && (
                            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={handleAddIdea}
                                className="p-2 rounded-lg text-white shadow-md shadow-purple-500/20" style={{ background: 'var(--gradient-idea)' }}>
                                <Plus className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>
                </motion.div>

                {loading ? (
                    <div className="text-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-4xl inline-block">⚡</motion.div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {ideas.map((idea) => {
                                const statusConfig = STATUS_COLORS[idea.status]
                                return (
                                    <motion.div key={idea.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }}
                                        className="p-4 rounded-xl border group" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>{idea.content}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                        style={{ background: statusConfig.bg, color: statusConfig.text }}>{statusConfig.label}</span>
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        {new Date(idea.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <InnovationAudit ideaContent={idea.content} />
                                                    <IdeaADR ideaContent={idea.content} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDelete(idea.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                                                    style={{ color: 'var(--text-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                                                {idea.status !== 'converti_en_projet' && (
                                                    <button
                                                        onClick={() => handleConvertToProject(idea)}
                                                        className="p-1.5 rounded-lg transition-colors hover:bg-green-500/10"
                                                        style={{ color: 'var(--text-muted)' }}
                                                        title="Convertir en projet"
                                                    >
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && ideas.length === 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 px-4 rounded-3xl border border-dashed" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(168, 85, 247, 0.02)' }}>
                        <div className="text-6xl mb-6">🔮</div>
                        <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Le Nexus attend votre vision</h3>
                        <p className="max-w-md mx-auto leading-relaxed mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                            L'Innovation Lab est la forge où vos idées prennent vie sous forme de spécifications d'élite.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                            <div className="p-5 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--border-subtle)' }}>
                                <div className="text-2xl mb-3">🎯</div>
                                <h4 className="text-xs font-black uppercase tracking-tighter text-gray-800 mb-2">Stratégie</h4>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">Définissez la cible et la valeur ajoutée réelle.</p>
                            </div>
                            <div className="p-5 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--border-subtle)' }}>
                                <div className="text-2xl mb-3">🛠️</div>
                                <h4 className="text-xs font-black uppercase tracking-tighter text-gray-800 mb-2">Ingénierie</h4>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">Générez des ADR et des schémas de données IA.</p>
                            </div>
                            <div className="p-5 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--border-subtle)' }}>
                                <div className="text-2xl mb-3">🚀</div>
                                <h4 className="text-xs font-black uppercase tracking-tighter text-gray-800 mb-2">Lancement</h4>
                                <p className="text-[10px] text-zinc-500 leading-relaxed">Cristallisez vos concepts en projets actifs.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppShell>
    )
}
