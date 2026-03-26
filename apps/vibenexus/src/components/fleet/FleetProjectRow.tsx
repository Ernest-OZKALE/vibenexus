'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Globe, Shield, Users, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'
import { Project, STATUS_CONFIG } from '@/lib/types'
import Link from 'next/link'

interface FleetProjectRowProps {
    project: Project
}

export default function FleetProjectRow({ project }: FleetProjectRowProps) {
    const [remoteStatus, setRemoteStatus] = useState<'loading' | 'online' | 'error'>('loading')
    const [latency, setLatency] = useState<number | null>(null)
    const config = STATUS_CONFIG[project.status]

    useEffect(() => {
        const checkHealth = async () => {
            if (!project.target_supabase_url || !project.target_supabase_anon_key) {
                setRemoteStatus('error')
                return
            }

            try {
                const res = await fetch('/api/fleet/health/supabase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: project.target_supabase_url,
                        key: project.target_supabase_anon_key
                    })
                })
                const data = await res.json()
                if (data.status === 'online') {
                    setRemoteStatus('online')
                    setLatency(data.latency)
                }
                else setRemoteStatus('error')
            } catch (err) {
                setRemoteStatus('error')
            }
        }
        checkHealth()
    }, [project])

    return (
        <motion.tr
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="group border-b transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
            style={{ borderColor: 'var(--border-subtle)' }}
        >
            <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg border flex items-center justify-center text-lg shadow-sm" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                        {config.icon}
                    </div>
                    <div>
                        <Link href={`/projects/${project.id}`} className="text-sm font-bold transition-colors hover:text-emerald-500" style={{ color: 'var(--text-primary)' }}>
                            {project.title}
                        </Link>
                        <p className="text-[10px] font-mono truncate max-w-[150px]" style={{ color: 'var(--text-muted)' }}>
                            {project.github_repo_full_name || 'Pas de Dépôt'}
                        </p>
                    </div>
                </div>
            </td>

            <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full pulse-dot"
                        style={{ background: config.color, boxShadow: `0 0 10px ${config.color}50` }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.color }}>
                        {config.label}
                    </span>
                </div>
            </td>

            <td className="py-4 px-6">
                {remoteStatus === 'loading' ? (
                    <div className="flex items-center gap-2 text-zinc-600 italic text-[10px]">
                        <Loader2 className="w-3 h-3 animate-spin" /> Ping en cours...
                    </div>
                ) : remoteStatus === 'online' ? (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase">
                            <Globe className="w-3 h-3" /> Connecté
                        </div>
                        {latency !== null && (
                            <span className="text-[9px] text-zinc-500 font-mono pl-5">{latency}ms</span>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-rose-500 text-[10px] uppercase font-bold">
                        <AlertCircle className="w-3 h-3" /> Non Configuré
                    </div>
                )}
            </td>

            <td className="py-4 px-6">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-600 uppercase font-black">Utilisateurs</span>
                        <span className="text-xs font-mono text-zinc-400">--</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-600 uppercase font-black">Erreurs</span>
                        <span className="text-xs font-mono text-zinc-400">0</span>
                    </div>
                </div>
            </td>

            <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => {
                            setRemoteStatus('loading')
                            // checkHealth is triggered by remoteStatus change if I add it to dependencies
                            // Actually it's triggered by project change. 
                            // I'll manually trigger it.
                            const checkHealth = async () => {
                                if (!project.target_supabase_url || !project.target_supabase_anon_key) {
                                    setRemoteStatus('error')
                                    return
                                }
                                try {
                                    const res = await fetch('/api/fleet/health/supabase', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            url: project.target_supabase_url,
                                            key: project.target_supabase_anon_key
                                        })
                                    })
                                    const data = await res.json()
                                    if (data.status === 'online') {
                                        setRemoteStatus('online')
                                        setLatency(data.latency)
                                    }
                                    else setRemoteStatus('error')
                                } catch (err) {
                                    setRemoteStatus('error')
                                }
                            }
                            checkHealth()
                        }}
                        className="p-2 rounded-xl border transition-all text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/30"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                        {remoteStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                    </button>
                    <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all hover:text-emerald-500 hover:border-emerald-500/30"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </td>
        </motion.tr>
    )
}
