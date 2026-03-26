'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Zap, FileText, ShieldAlert, GitPullRequest, Clock, Hammer } from 'lucide-react'
import { getEvents } from '@/lib/queries'
import { NexusEvent } from '@/lib/types'

const EVENT_ICONS = {
    healthcheck_fail: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' },
    adr_generated: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    autofix_pr: { icon: GitPullRequest, color: 'text-green-400', bg: 'bg-green-400/10' },
    intelligence_audit: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    project_foundry: { icon: Hammer, color: 'text-blue-400', bg: 'bg-blue-400/10' },
}

export default function ActivityFeed() {
    const [events, setEvents] = useState<(NexusEvent & { projects: { title: string } | null })[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadEvents() {
            try {
                const data = await getEvents()
                setEvents(data)
            } catch (err) {
                console.error('Erreur events:', err)
            } finally {
                setLoading(false)
            }
        }
        loadEvents()

        // Refresh every minute
        const timer = setInterval(loadEvents, 60000)
        return () => clearInterval(timer)
    }, [])

    if (loading && events.length === 0) {
        return <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--bg-elevated)' }} />)}
        </div>
    }

    if (events.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed rounded-xl" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune activité récente dans le Nexus.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {events.map((ev) => {
                    const cfg = EVENT_ICONS[ev.type as keyof typeof EVENT_ICONS] || { icon: Bell, color: 'text-zinc-500', bg: 'bg-zinc-100' }
                    const Icon = cfg.icon

                    return (
                        <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-4 p-3 rounded-xl border transition-all hover:shadow-md group"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className={`p-2 rounded-lg shrink-0 ${cfg.bg}`}>
                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</h4>
                                    <span className="text-[10px] whitespace-nowrap flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                        <Clock className="w-3 h-3" />
                                        {new Date(ev.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[11px] leading-relaxed line-clamp-2 italic flex-1" style={{ color: 'var(--text-secondary)' }}>
                                        {ev.description}
                                    </p>
                                    {ev.projects && (
                                        <span className="shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 uppercase border border-zinc-200">
                                            {ev.projects.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
