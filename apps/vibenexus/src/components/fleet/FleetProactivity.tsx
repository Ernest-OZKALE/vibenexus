'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertCircle, CheckCircle2, ArrowRight, Loader2, BrainCircuit } from 'lucide-react'

interface ProactiveAction {
    id: string
    projectId: string
    projectTitle: string
    type: 'critical' | 'suggestion' | 'optimization'
    message: string
    actionLabel: string
    impact: string
}

export default function FleetProactivity() {
    const [actions, setActions] = useState<ProactiveAction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSuggestions() {
            setLoading(true)
            try {
                // In a real scenario, this would call an AI endpoint analyzing all project data
                const res = await fetch('/api/ai/proactive')
                if (res.ok) {
                    const data = await res.json()
                    setActions(data.actions)
                }
            } catch (err) {
                console.error('Failed to fetch proactive suggestions')
            } finally {
                setLoading(false)
            }
        }
        fetchSuggestions()
    }, [])

    if (loading) {
        return (
            <div className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-premium flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Analyse de la flotte en cours...</p>
            </div>
        )
    }

    if (actions.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <BrainCircuit className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Intelligence Proactive</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                    {actions.map((action, idx) => (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-xl border flex gap-4 items-start transition-all hover:shadow-md ${action.type === 'critical' ? 'bg-rose-50 border-rose-100' :
                                action.type === 'optimization' ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${action.type === 'critical' ? 'bg-rose-500/10 text-rose-500' :
                                action.type === 'optimization' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                {action.type === 'critical' ? <AlertCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-200/50 text-zinc-600">
                                        {action.projectTitle}
                                    </span>
                                    <span className={`text-[8px] font-bold uppercase ${action.type === 'critical' ? 'text-rose-600' :
                                        action.type === 'optimization' ? 'text-blue-600' : 'text-emerald-600'
                                        }`}>
                                        {action.type}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-zinc-900 leading-tight mb-1">
                                    {action.message}
                                </p>
                                <p className="text-[10px] text-zinc-600 italic mb-3">
                                    Impact: {action.impact}
                                </p>
                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-900 hover:text-emerald-600 transition-colors group">
                                    {action.actionLabel} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
