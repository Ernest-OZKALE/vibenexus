'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleDot, User, MessageSquare, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

interface GitHubIssue {
    id: number
    number: number
    title: string
    user: {
        login: string
        avatar_url: string
    }
    labels: Array<{ name: string, color: string }>
    comments: number
    html_url: string
    created_at: string
}

export default function ProjectIssues({ repoFullName }: { repoFullName: string }) {
    const [issues, setIssues] = useState<GitHubIssue[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/github/issues?repo=${repoFullName}`)
                if (!res.ok) throw new Error('Impossible de charger les tickets')
                const data = await res.json()
                setIssues(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (repoFullName) fetchIssues()
    }, [repoFullName])

    if (loading) return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        </div>
    )

    if (error) return (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
        </div>
    )

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CircleDot className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>GitHub Issues</h3>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                    {issues.length} OPEN
                </span>
            </div>

            {issues.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-2xl" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-xs text-zinc-500">Aucun ticket ouvert. Beau travail ! ☕</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {issues.map((issue) => (
                        <motion.a
                            key={issue.id}
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-2 p-3 rounded-xl border bg-black/20 hover:border-emerald-500/30 transition-all group"
                            style={{ borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-bold leading-snug group-hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                    <span className="text-zinc-500 mr-1">#{issue.number}</span>
                                    {issue.title}
                                </h4>
                                <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {issue.labels.map(label => (
                                    <span
                                        key={label.name}
                                        className="text-[9px] px-1.5 py-0.5 rounded-md font-medium"
                                        style={{
                                            backgroundColor: `#${label.color}20`,
                                            color: `#${label.color}`,
                                            border: `1px solid #${label.color}40`
                                        }}
                                    >
                                        {label.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                        <img src={issue.user.avatar_url} alt="" className="w-3.5 h-3.5 rounded-full border border-zinc-800" />
                                        {issue.user.login}
                                    </div>
                                    {issue.comments > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <MessageSquare className="w-3 h-3" />
                                            {issue.comments}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[9px] text-zinc-600">
                                    {new Date(issue.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.a>
                    ))}
                </div>
            )}
        </div>
    )
}
