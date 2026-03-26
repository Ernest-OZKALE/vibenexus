import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2, AlertTriangle, Zap, Target, HelpCircle } from 'lucide-react'

interface AuditData {
    feasibilityScore: number
    innovationScore: number
    effortEstimate: string
    challenges: string[]
    utility: string
    verdict: string
}

export default function InnovationAudit({ ideaContent }: { ideaContent: string }) {
    const [audit, setAudit] = useState<AuditData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const performAudit = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/innovation/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ideaContent })
            })
            if (!res.ok) throw new Error('Audit failed')
            const data = await res.json()
            setAudit(data.audit)
        } catch (err) {
            setError('Échec de l\'audit technique.')
        } finally {
            setLoading(false)
        }
    }

    if (!audit && !loading) {
        return (
            <button
                onClick={performAudit}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-emerald-500/10 hover:text-emerald-500 border border-transparent hover:border-emerald-500/20"
                style={{ color: 'var(--text-muted)' }}
            >
                <ShieldCheck className="w-3.5 h-3.5" />
                Audit de Faisabilité
            </button>
        )
    }

    if (loading) {
        return (
            <div className="mt-4 p-4 rounded-xl border flex items-center gap-3 animate-pulse" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Calcul de viabilité technique...</span>
            </div>
        )
    }

    if (error) {
        return <div className="mt-2 text-[10px] text-red-500">{error}</div>
    }

    if (!audit) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl border space-y-4"
            style={{ background: 'var(--bg-elevated)', borderLeft: '4px solid #10B981', borderColor: 'var(--border-subtle)' }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Innovation Audit</span>
                </div>
                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase">Faisabilité</p>
                        <p className={`text-sm font-bold ${audit.feasibilityScore > 7 ? 'text-emerald-500' : audit.feasibilityScore > 4 ? 'text-amber-500' : 'text-red-500'}`}>
                            {audit.feasibilityScore}/10
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase">Innovation</p>
                        <p className="text-sm font-bold text-purple-500">{audit.innovationScore}/10</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Utility
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{audit.utility}</p>
                </div>
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Effort
                    </h4>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{audit.effortEstimate}</p>
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
                <h4 className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Défis Majeurs
                </h4>
                <div className="flex flex-wrap gap-2">
                    {audit.challenges.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                            {c}
                        </span>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <p className="text-xs italic p-2 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                    &ldquo;{audit.verdict}&rdquo;
                </p>
            </div>
        </motion.div>
    )
}
