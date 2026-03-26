'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, CheckCircle2, XCircle, Clock, ExternalLink, Loader2, RotateCcw, Activity } from 'lucide-react'
import { type GitHubWorkflowRun } from '@/lib/github'

export default function ProjectPipelines({ repoFullName, defaultBranch }: { repoFullName: string, defaultBranch: string }) {
    const [runs, setRuns] = useState<GitHubWorkflowRun[]>([])
    const [loading, setLoading] = useState(true)
    const [triggering, setTriggering] = useState<number | null>(null)

    const fetchRuns = async () => {
        try {
            const res = await fetch(`/api/github/actions?repo=${repoFullName}`)
            const data = await res.json()
            if (Array.isArray(data)) setRuns(data)
        } catch (err) {
            console.error('Error loading builds:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (repoFullName) fetchRuns()

        // Polling every 30s
        const interval = setInterval(fetchRuns, 30000)
        return () => clearInterval(interval)
    }, [repoFullName])

    const handleTrigger = async (workflowId: number | string) => {
        setTriggering(Number(workflowId))
        try {
            const res = await fetch('/api/github/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoFullName,
                    workflowId,
                    ref: defaultBranch || 'main'
                })
            })
            if (res.ok) {
                // Wait a bit for GitHub to create the run
                setTimeout(fetchRuns, 2000)
            }
        } catch (err) {
            console.error('Error triggering build:', err)
        } finally {
            setTriggering(null)
        }
    }

    if (loading) return (
        <div className="flex items-center gap-2 text-xs text-zinc-500 py-4">
            <Loader2 className="w-3 h-3 animate-spin" /> Supervision des pipelines CI/CD...
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>GitHub Actions Pipelines</h3>
                </div>
                <button
                    onClick={() => fetchRuns()}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-2">
                {runs.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-2xl" style={{ borderColor: 'var(--border-subtle)' }}>
                        <p className="text-xs text-zinc-500 italic">Aucun workflow détecté sur ce dépôt.</p>
                    </div>
                ) : (
                    runs.map((run) => (
                        <div
                            key={run.id}
                            className="flex items-center justify-between p-3 rounded-xl border bg-black/20"
                            style={{ borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${run.status === 'completed'
                                        ? (run.conclusion === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')
                                        : 'bg-blue-500/10 text-blue-500 animate-pulse'
                                    }`}>
                                    {run.status === 'completed' ? (
                                        run.conclusion === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />
                                    ) : (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {run.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                        <span className="truncate max-w-[80px]">#{run.id}</span>
                                        <span>•</span>
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>{new Date(run.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {run.status === 'completed' && (
                                    <button
                                        onClick={() => handleTrigger(run.id)}
                                        disabled={triggering !== null}
                                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-purple-400 transition-colors"
                                        title="Rerun Workflow"
                                    >
                                        {triggering === run.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                    </button>
                                )}
                                <a
                                    href={run.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
