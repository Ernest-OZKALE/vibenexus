'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertTriangle, CheckCircle2, RefreshCw, ChevronRight } from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import { Project } from '@/lib/types'

interface FleetPulseProps {
    projects: Project[]
}

interface StrategicAlert {
    title: string
    severity: 'HIGH' | 'MEDIUM' | 'LOW'
    description: string
    projectId?: string
}

interface FleetAudit {
    globalStatus: 'STABLE' | 'VULNERABLE' | 'CRITICAL'
    strategicAlerts: StrategicAlert[]
    synergyScore: number
    recommendations: string[]
}

export default function FleetPulse({ projects }: FleetPulseProps) {
    const [audit, setAudit] = useState<FleetAudit | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const runPulseCheck = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/fleet/pulse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projects })
            })
            if (!res.ok) throw new Error('Échec du scan de la flotte')
            const data = await res.json()
            setAudit(data.audit)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (projects.length > 0 && !audit && !loading) {
            runPulseCheck()
        }
    }, [projects])

    return (
        <div className="mb-8 p-6 rounded-2xl border shadow-premium relative overflow-hidden"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>

            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 transition-colors duration-1000 ${audit?.globalStatus === 'CRITICAL' ? 'bg-red-500' :
                audit?.globalStatus === 'VULNERABLE' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Zap className={`w-5 h-5 ${loading ? 'animate-pulse text-amber-500' : 'text-emerald-500'}`} />
                        Diagnostic de la Flotte
                        <HelpTooltip
                            title="Diagnostic de la Flotte"
                            description="Analyse IA automatique de l'état de santé de tous vos projets. Détecte les risques, vulnérabilités et synergies entre projets."
                            steps={['Cliquez sur le bouton rafraîchir pour lancer un diagnostic', 'Consultez le statut global (Stable, Vulnérable, Critique)', 'Lisez les alertes stratégiques classées par sévérité', 'Suivez les recommandations proposées']}
                        />
                    </h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Scanning des risques et synergies</p>
                </div>
                <button
                    onClick={runPulseCheck}
                    disabled={loading}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && !audit ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 animate-pulse font-mono uppercase tracking-tighter">Analyse en cours...</p>
                </div>
            ) : error ? (
                <div className="py-8 text-center text-red-500 text-sm font-medium">{error}</div>
            ) : audit ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                    {/* Status Column */}
                    <div className="lg:col-span-3 flex flex-col justify-center border-r border-gray-200 pr-8">
                        <div className="mb-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block text-center">Santé Globale</span>
                            <div className="flex justify-center">
                                {audit.globalStatus === 'STABLE' ? (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2" />
                                        <span className="text-xl font-black text-emerald-500">OPTIMAL</span>
                                    </div>
                                ) : audit.globalStatus === 'VULNERABLE' ? (
                                    <div className="flex flex-col items-center">
                                        <AlertTriangle className="w-16 h-16 text-amber-500 mb-2" />
                                        <span className="text-xl font-black text-amber-500">VULNÉRABLE</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <AlertTriangle className="w-16 h-16 text-red-500 mb-2" />
                                        <span className="text-xl font-black text-red-500">CRITIQUE</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block text-center">Synergie</span>
                            <div className="text-3xl font-black text-indigo-500">{audit.synergyScore}%</div>
                        </div>
                    </div>

                    {/* Alerts Column */}
                    <div className="lg:col-span-9 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {audit.strategicAlerts.map((alert, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-4 rounded-xl border flex gap-3 ${alert.severity === 'HIGH' ? 'bg-red-500/5 border-red-500/20' :
                                        alert.severity === 'MEDIUM' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
                                        }`}
                                >
                                    <div className={`mt-1 shrink-0 ${alert.severity === 'HIGH' ? 'text-red-500' :
                                        alert.severity === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'
                                        }`}>
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{alert.title}</h4>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed">{alert.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                                <ChevronRight className="w-3 h-3" /> Recommandations Stratégiques
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {audit.recommendations.map((rec, i) => (
                                    <span key={i} className="px-3 py-1 rounded-lg bg-gray-50 text-[11px] font-medium text-gray-500 border border-gray-200">
                                        {rec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="py-12 border border-dashed border-gray-200 rounded-xl text-center text-gray-500 text-sm">
                    En attente du premier diagnostic...
                </div>
            )}

        </div>
    )
}
