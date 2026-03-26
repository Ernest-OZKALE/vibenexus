'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Calendar, Clock, Tag, MessageSquare, Zap, Bug, Sparkles, Filter, ChevronDown, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Log, LogType } from '@/lib/types'
import MarkdownContent from '@/components/ui/MarkdownContent'

interface JournalFeedProps {
    logs: Log[]
    onDelete?: (id: string) => void
}

const CATEGORY_CONFIG: Record<LogType, { label: string, icon: any, color: string, bg: string, border: string }> = {
    'journal': { label: 'Note Technique', icon: BookOpen, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
    'prochaine_etape': { label: 'Feature / Plan', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'erreur_critique': { label: 'Incident / Bug', icon: Bug, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
}

export default function JournalFeed({ logs, onDelete }: JournalFeedProps) {
    const [filter, setFilter] = useState<LogType | 'all'>('all')

    const filteredLogs = logs.filter(l => filter === 'all' || l.log_type === filter)

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-700">Journal de Bord</h3>
                        <p className="text-[9px] text-gray-400 font-mono italic">ENGINEERING LEDGER</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${filter === 'all' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                        Tous
                    </button>
                    {Object.entries(CATEGORY_CONFIG).map(([type, config]) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type as LogType)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 ${filter === type ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                            <config.icon className={`w-3 h-3 ${filter === type ? 'text-white' : config.color}`} />
                            <span className="hidden lg:inline">{config.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline Feed */}
            <div className="relative pl-10 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-emerald-300 before:via-gray-200 before:to-transparent">
                <AnimatePresence mode="popLayout">
                    {filteredLogs.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-10 text-gray-400" />
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Silène Radio...</p>
                            <p className="text-[10px] text-gray-400 mt-2">Aucune donnée enregistrée dans cette catégorie</p>
                        </div>
                    ) : (
                        filteredLogs.map((log, idx) => {
                            const config = CATEGORY_CONFIG[log.log_type]
                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: idx * 0.03 }}
                                    className="relative group"
                                >
                                    {/* Timeline Node */}
                                    <div className="absolute -left-[32px] top-1.5 w-6 h-6 rounded-full border-4 bg-white flex items-center justify-center z-10 transition-all group-hover:scale-110 shadow-sm border-gray-200 group-hover:border-emerald-400">
                                        <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                                    </div>

                                    {/* Card */}
                                    <div className="group/card relative p-6 rounded-2xl border border-gray-200 transition-all duration-500 bg-white hover:border-emerald-200 shadow-sm hover:shadow-md">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-2xl ${config.bg} ${config.color} border ${config.border}`}>
                                                    <config.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[11px] font-black uppercase tracking-[2px] ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="text-[10px] font-mono text-gray-400">ID: {log.id.slice(0, 8)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 opacity-40" />
                                                            {new Date(log.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 opacity-40" />
                                                            {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-2 group-hover/card:translate-x-0">
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(log.id)}
                                                        className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-200 transition-all group/del"
                                                    >
                                                        <Trash2 className="w-4 h-4 group-hover/del:rotate-12 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-sm leading-[1.8] text-gray-700 pl-1 font-medium">
                                            <MarkdownContent content={log.content} />
                                        </div>

                                        {/* Subtle corner accent */}
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <config.icon className="w-16 h-16 -rotate-12" />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
