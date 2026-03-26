'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { type GitHubWorkflowRun } from '@/lib/github'

interface DevOpsHealthScoreProps {
    techDebtScore: number
    projectId: string
    repoFullName: string | null
}

export default function DevOpsHealthScore({ techDebtScore, projectId, repoFullName }: DevOpsHealthScoreProps) {
    const [score, setScore] = useState(100)
    const [loading, setLoading] = useState(true)
    const [details, setDetails] = useState({
        failedRuns: 0,
        incidents: 0
    })

    useEffect(() => {
        const calculateHealth = async () => {
            let baseScore = 100
            let failedRuns = 0
            let incidents = 0

            // 1. Penalize Tech Debt (0-10) -> -2 points each
            baseScore -= (techDebtScore * 2)

            // 2. Fetch Workflow Runs if repo exists
            if (repoFullName) {
                try {
                    const res = await fetch(`/api/github/actions?repo=${repoFullName}`)
                    const runs: GitHubWorkflowRun[] = await res.json()
                    if (Array.isArray(runs)) {
                        failedRuns = runs.filter(r => r.status === 'completed' && r.conclusion === 'failure').length
                        baseScore -= (failedRuns * 5) // -5 points per failed run
                    }
                } catch (err) {
                    console.error('Error fetching runs for health score:', err)
                }
            }

            // 3. Final clamp
            setScore(Math.max(0, Math.min(100, baseScore)))
            setDetails({ failedRuns, incidents })
            setLoading(false)
        }

        calculateHealth()
    }, [techDebtScore, repoFullName])

    const getScoreColor = (s: number) => {
        if (s > 80) return 'text-emerald-500'
        if (s > 50) return 'text-amber-500'
        return 'text-red-500'
    }

    const getScoreBackground = (s: number) => {
        if (s > 80) return 'bg-emerald-500/10'
        if (s > 50) return 'bg-amber-500/10'
        return 'bg-red-500/10'
    }

    if (loading) return null

    return (
        <div className="p-6 rounded-3xl border bg-white" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>DevOps Health Score</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getScoreBackground(score)} ${getScoreColor(score)}`}>
                    {score > 80 ? 'Reliable' : score > 50 ? 'Warning' : 'Critical'}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-6">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200"
                        />
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={364.4}
                            initial={{ strokeDashoffset: 364.4 }}
                            animate={{ strokeDashoffset: 364.4 - (364.4 * score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`${getScoreColor(score)}`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{Math.round(score)}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">/ 100</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">Dette Tech</p>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{techDebtScore}/10</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">Échecs CI/CD</p>
                        <p className={`text-sm font-bold ${details.failedRuns > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{details.failedRuns}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-[10px] text-zinc-500 italic leading-snug">
                    {score > 80
                        ? "Système hautement résilient. Tout est vert."
                        : "Attention nécessaire sur la CI/CD ou la dette technique."}
                </p>
            </div>
        </div>
    )
}
