import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Globe, Loader2, RefreshCw } from 'lucide-react'

interface VercelStatus {
    status: string
    url: string | null
    updatedAt: string | null
}

export default function VercelBadge({ projectId }: { projectId: string | null }) {
    const [status, setStatus] = useState<VercelStatus | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchStatus = async () => {
        if (!projectId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/deployment/status?projectId=${projectId}`)
            if (res.ok) {
                const data = await res.json()
                setStatus(data)
            }
        } catch (err) {
            console.error('Failed to fetch Vercel status')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [projectId])

    if (!projectId) return null

    const colors: Record<string, string> = {
        READY: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5',
        BUILDING: 'text-amber-500 border-amber-500/20 bg-amber-500/5',
        ERROR: 'text-rose-500 border-rose-500/20 bg-rose-500/5',
        UNKNOWN: 'text-zinc-500 border-zinc-800 bg-black/20'
    }

    const color = colors[status?.status || 'UNKNOWN']

    return (
        <div className={`flex flex-col gap-2 p-3 rounded-xl border ${color} transition-all`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Déploiement Vercel</span>
                </div>
                <button onClick={fetchStatus} disabled={loading} className="p-1 hover:bg-black/10 rounded">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                </button>
            </div>

            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase">
                    {status?.status || (loading ? 'FETCHING...' : 'NOT_LINKED')}
                </span>
                {status?.url && (
                    <a href={`https://${status.url}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-black/10 rounded">
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
    )
}
