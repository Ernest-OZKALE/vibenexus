import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Trophy, AlertTriangle, Lightbulb, Zap, TrendingUp } from 'lucide-react'

interface RoundupData {
    summary: string
    achievements: string[]
    blockers: string[]
    recommendations: string[]
    velocityStatus: 'HIGH' | 'STABLE' | 'LOW'
    mood: 'EMERALD' | 'AMBER' | 'ROSE'
}

export default function WeeklyRoundup({ logs }: { logs: any[] }) {
    const [roundup, setRoundup] = useState<RoundupData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateRoundup = async () => {
        if (logs.length === 0) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/roundup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs: logs.slice(0, 50) }) // Last 50 logs max
            })
            if (!res.ok) throw new Error('Failed to generate roundup')
            const data = await res.json()
            setRoundup(data.roundup)
        } catch (err) {
            setError('Échec de la synthèse IA.')
        } finally {
            setLoading(false)
        }
    }

    const moodColors = {
        EMERALD: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        AMBER: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        ROSE: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
    }

    const mood = roundup ? moodColors[roundup.mood] : moodColors.EMERALD

    return (
        <div className="space-y-4">
            {!roundup && !loading ? (
                <button
                    onClick={generateRoundup}
                    disabled={logs.length === 0}
                    className="w-full py-4 rounded-2xl border border-dashed border-zinc-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 transition-all group flex flex-col items-center justify-center gap-2"
                >
                    <Sparkles className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-emerald-500">Générer le Weekly Roundup</span>
                </button>
            ) : loading ? (
                <div className="p-10 rounded-2xl border bg-white border-zinc-100 flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <div>
                        <p className="text-sm font-bold text-zinc-400">Analyse de la dynamique hebdomadaire...</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Évaluation de la vélocité et des risques...</p>
                    </div>
                </div>
            ) : roundup ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border ${mood.bg} ${mood.border} space-y-6 relative overflow-hidden`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className={`w-5 h-5 ${mood.text}`} />
                            <h3 className="text-sm font-black uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Résumé Hebdomadaire IA</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-zinc-500" />
                            <span className="text-[10px] font-bold text-zinc-500">VELOCITY: {roundup.velocityStatus}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
                            &ldquo;{roundup.summary}&rdquo;
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5" /> Réussites Clés
                            </h4>
                            <ul className="space-y-1.5">
                                {roundup.achievements.map((a, i) => (
                                    <li key={i} className="text-xs text-zinc-600 flex gap-2">
                                        <span className="text-emerald-500">•</span> {a}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> Bloquants & Risques
                            </h4>
                            <ul className="space-y-1.5">
                                {roundup.blockers.map((b, i) => (
                                    <li key={i} className="text-xs text-zinc-600 flex gap-2">
                                        <span className="text-rose-500">•</span> {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/50">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 mb-3">
                            <Lightbulb className="w-3.5 h-3.5" /> Recommandations Tactiques
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {roundup.recommendations.map((r, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-xl bg-white border border-zinc-100 text-[10px] text-zinc-600">
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setRoundup(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-black/20 text-zinc-500"
                    >
                        <Sparkles className="w-3 h-3" />
                    </button>
                </motion.div>
            ) : null}

            {error && <div className="text-[10px] text-rose-500 text-center">{error}</div>}
        </div>
    )
}
