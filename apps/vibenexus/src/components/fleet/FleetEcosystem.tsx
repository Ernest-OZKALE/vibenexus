'use client'

import { Project } from '@/lib/types'
import { motion } from 'framer-motion'
import { Share2, ZoomIn, GitBranch, Activity, Layers } from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import MarkdownContent from '@/components/ui/MarkdownContent'
import { useMemo } from 'react'

interface FleetEcosystemProps {
    projects: Project[]
}

export default function FleetEcosystem({ projects }: FleetEcosystemProps) {
    const mermaidChart = useMemo(() => {
        if (projects.length === 0) return ''

        let chart = 'graph LR\n'
        chart += '  subgraph "VibeNexus Hub"\n'
        chart += '    Hub(VibeNexus)\n'
        chart += '  end\n\n'

        // Styles — light theme compatible
        chart += '  classDef default fill:#F1F5F9,stroke:#CBD5E1,color:#334155,stroke-width:1px;\n'
        chart += '  classDef project fill:#ECFDF5,stroke:#6EE7B7,color:#065F46,stroke-width:2px,rx:10,ry:10;\n'
        chart += '  classDef unstable fill:#FFFBEB,stroke:#FCD34D,color:#92400E,rx:10,ry:10;\n'
        chart += '  classDef dead fill:#FEF2F2,stroke:#FCA5A5,color:#991B1B,rx:10,ry:10;\n'

        // Nodes & Hub connections
        projects.forEach(p => {
            const nodeId = p.id.replace(/-/g, '')
            chart += `  ${nodeId}["${p.title}"]\n`
            chart += `  Hub -.-> ${nodeId}\n`

            if (p.status === 'vibecoding') chart += `  class ${nodeId} project;\n`
            else if (p.status === 'hibernation') chart += `  class ${nodeId} unstable;\n`
            else if (p.status === 'cimetière') chart += `  class ${nodeId} dead;\n`
        })

        // Infer dependencies (Self-discovery)
        projects.forEach(p1 => {
            projects.forEach(p2 => {
                if (p1.id === p2.id) return

                const id1 = p1.id.replace(/-/g, '')
                const id2 = p2.id.replace(/-/g, '')

                const titleLower = p1.title.toLowerCase()
                const descLower = (p1.description || '').toLowerCase()
                const targetTitle = p2.title.toLowerCase()

                if (descLower.includes(targetTitle) || p1.tags?.some(t => t.toLowerCase() === targetTitle)) {
                    chart += `  ${id1} ==> ${id2}\n`
                }
            })
        })

        return `\`\`\`mermaid\n${chart}\n\`\`\``
    }, [projects])

    // Stats
    const activeCount = projects.filter(p => p.status === 'vibecoding' || p.status === 'stable').length
    const hibernatingCount = projects.filter(p => p.status === 'hibernation').length
    const criticalCount = projects.filter(p => p.status === 'cimetière').length

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 shadow-sm mb-8 overflow-hidden bg-white"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-black flex items-center gap-2 text-gray-900">
                        <Share2 className="w-5 h-5 text-emerald-500" /> Carte de l&apos;Écosystème
                        <HelpTooltip
                            title="Carte de l'Écosystème"
                            description="Visualisation interactive des relations entre vos projets. L'IA infère les dépendances à partir des descriptions et tags."
                            steps={['Observez les connexions entre projets', 'Les couleurs indiquent le statut (vert=actif, jaune=pause, rouge=critique)', 'Les flèches pleines indiquent des dépendances détectées']}
                        />
                    </h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Visualisation des dépendances et flux</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-600">Carte Dynamique</div>
                    <ZoomIn className="w-4 h-4 text-gray-400 opacity-50" />
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 px-6 py-3 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-gray-600"><strong className="text-gray-900">{activeCount}</strong> actifs</span>
                </div>
                <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-gray-600"><strong className="text-gray-900">{hibernatingCount}</strong> en pause</span>
                </div>
                <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600"><strong className="text-gray-900">{projects.length}</strong> total</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="p-6">
                <div className="bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 rounded-xl p-6 min-h-[300px] flex items-center justify-center border border-gray-100 relative overflow-hidden">
                    {/* Decorative grid pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'radial-gradient(circle, #10B981 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }} />

                    {projects.length > 0 ? (
                        <div className="w-full relative z-10">
                            <MarkdownContent content={mermaidChart} />
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Aucune donnée pour générer la carte.</p>
                            <p className="text-gray-300 text-xs mt-1">Ajoutez des projets pour visualiser l&apos;écosystème</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-gray-500 border-t border-gray-100 px-6 py-3 bg-gray-50/30">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" /> Actif / Vibe</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20" /> Hibernation</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20" /> Critique</div>
                <div className="ml-auto italic opacity-50">Découverte v1.0 (Inféré par l'IA)</div>
            </div>
        </motion.div>
    )
}
