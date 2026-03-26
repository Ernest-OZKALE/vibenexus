'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import FleetProjectRow from '@/components/fleet/FleetProjectRow'
import { getProjects } from '@/lib/queries'
import { Project } from '@/lib/types'
import { motion } from 'framer-motion'
import { Ship, Activity, Filter, Search, RefreshCw } from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import FleetEcosystem from '@/components/fleet/FleetEcosystem'
import FleetPulse from '@/components/fleet/FleetPulse'

export default function FleetPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const data = await getProjects()
                setProjects(data)
            } catch (err) {
                console.error('Failed to load fleet projects')
            } finally {
                setLoading(false)
            }
        }
        loadProjects()
    }, [])

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <AppShell>
            <div className="w-full px-6 lg:px-12 py-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <Ship className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-black italic tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                Flotte Autonome
                            </h1>
                            <HelpTooltip
                                title="Flotte Autonome"
                                description="Vue d'ensemble de tous vos projets satellites. La flotte surveille l'état de vos bases de données et agrège les métriques de santé en temps réel."
                                steps={['Consultez l\'état global de vos projets', 'Utilisez la barre de recherche pour filtrer', 'Cliquez sur Synchroniser pour rafraîchir les données']}
                            />
                        </div>
                        <div className="max-w-xl p-4 rounded-xl border bg-emerald-500/5 mt-4" style={{ borderColor: 'var(--border-subtle)' }}>
                            <h3 className="text-sm font-bold text-emerald-500 mb-1 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Tour de Contrôle
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Cet écran est votre centre de commandement pour observer tous vos projets satellites. Il <strong className="text-gray-700">ping en temps réel</strong> vos bases de données de production (Supabase) pour vérifier qu'elles sont "Online", et agrège l'état global et les métriques de la flotte.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filtrer la flotte..."
                                className="pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:border-emerald-500/30 w-64"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.reload()} // For now, just reload to see updates
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Synchroniser la Flotte
                        </motion.button>
                        <button className="p-2.5 rounded-xl border transition-colors hover:text-emerald-500" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-6 rounded-2xl border shadow-premium" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Navires Totaux</span>
                            <Ship className="w-4 h-4 text-zinc-400" />
                        </div>
                        <p className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{projects.length}</p>
                    </div>
                    <div className="p-6 rounded-2xl border shadow-premium" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Liens Actifs</span>
                            <Activity className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-4xl font-black text-emerald-500">
                            {projects.filter(p => p.target_supabase_url).length}
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl border shadow-premium" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Charge Système</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>Optimal</p>
                    </div>
                </div>

                {/* Pulse Intelligence (Phase 28) */}
                {!loading && projects.length > 0 && (
                    <div className="mb-6">
                        <FleetPulse projects={projects} />
                    </div>
                )}

                {/* Ecosystem Map (Phase 28) */}
                {!loading && projects.length > 0 && (
                    <FleetEcosystem projects={projects} />
                )}

                {/* Fleet Table */}
                <div className="border rounded-2xl overflow-hidden shadow-premium" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                    <table className="w-full text-left max-w-full">
                        <thead>
                            <tr className="border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Projet</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Statut</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Synchronisation</th>
                                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Métriques</th>
                                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">Détails</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b border-gray-100">
                                        <td colSpan={5} className="py-8 px-6 bg-gray-50" />
                                    </tr>
                                ))
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-gray-400 text-sm">
                                        Aucun navire trouvé dans la flotte.
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map(project => (
                                    <FleetProjectRow key={project.id} project={project} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppShell>
    )
}
