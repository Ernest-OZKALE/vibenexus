'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Globe, CheckCircle2, Clock, ExternalLink, Loader2 } from 'lucide-react'

interface Deployment {
    id: number
    environment: string
    description: string
    created_at: string
    status: 'success' | 'failure' | 'pending' | 'in_progress' | 'queued' | 'unknown'
    target_url: string | null
}

export default function DeploymentHUD({ repoFullName }: { repoFullName: string }) {
    const [deployments, setDeployments] = useState<Deployment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const res = await fetch(`/api/github/deployments?repo=${repoFullName}`)
                const data = await res.json()
                if (Array.isArray(data)) setDeployments(data)
            } catch (err) {
                console.error('Error loading deployments:', err)
            } finally {
                setLoading(false)
            }
        }
        if (repoFullName) fetchDeployments()
    }, [repoFullName])

    if (loading) return (
        <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Pilotage des environnements...
        </div>
    )

    if (deployments.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Statut des Déploiements</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {deployments.map((dep) => (
                    <div
                        key={dep.id}
                        className="flex items-center justify-between p-3 rounded-xl border bg-black/20"
                        style={{ borderColor: 'var(--border-subtle)' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${dep.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                dep.status === 'failure' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-500/10 text-zinc-500'
                                }`}>
                                <Globe className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {dep.environment}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                    <Clock className="w-3 h-3" />
                                    {new Date(dep.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${dep.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                dep.status === 'failure' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                {dep.status}
                            </span>
                            {dep.target_url && (
                                <a
                                    href={dep.target_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
