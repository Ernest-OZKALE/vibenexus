'use client'

import { motion } from 'framer-motion'
import { TrendingUp, BarChart3, Activity, ShieldCheck } from 'lucide-react'
import { Project } from '@/lib/types'

interface FleetAnalyticsProps {
    projects: Project[]
}

export default function FleetAnalytics({ projects }: FleetAnalyticsProps) {
    const total = projects.length
    if (total === 0) return null

    const stableCount = projects.filter(p => p.status === 'stable' || p.status === 'vibecoding').length
    const cohesion = Math.round((stableCount / total) * 100)

    const avgTechDebt = Math.round(projects.reduce((acc, p) => acc + (p.tech_debt_score || 0), 0) / total)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cohesion Meter */}
            <div className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-premium space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Cohésion de la Flotte</h3>
                    <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-zinc-900">{cohesion}%</span>
                    <span className="text-[10px] font-bold text-emerald-500 mb-1 uppercase tracking-tighter flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> Opérationnel
                    </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cohesion}%` }}
                        className="h-full bg-emerald-500"
                    />
                </div>
                <p className="text-[9px] text-zinc-500 leading-tight">
                    Ratio de projets en phase active ou stable sur l'ensemble de la flotte.
                </p>
            </div>

            {/* Health Score */}
            <div className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-premium space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Dette Technique Moy.</h3>
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-zinc-900">{avgTechDebt}%</span>
                    <span className={`text-[10px] font-bold mb-1 uppercase tracking-tighter ${avgTechDebt < 40 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {avgTechDebt < 40 ? 'Sain' : 'À Réviser'}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${avgTechDebt}%` }}
                        className={`h-full ${avgTechDebt < 40 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                </div>
                <p className="text-[9px] text-zinc-500 leading-tight">
                    Moyenne de la dette technique calculée sur tous les segments de la flotte.
                </p>
            </div>

            {/* AI Governance */}
            <div className="p-6 rounded-2xl border border-zinc-100 bg-white shadow-premium space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Gouvernance IA</h3>
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                        <span className="text-zinc-500">ADR Autonomes</span>
                        <span className="text-emerald-500">Actif</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                        <span className="text-zinc-500">Webhooks Intelligents</span>
                        <span className="text-emerald-500">Synchro</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                        <span className="text-zinc-500">Contrôle Flotte</span>
                        <span className="text-purple-500">Verrouillé</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
