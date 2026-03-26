import { motion } from 'framer-motion'
import { Activity, Flame, TrendingUp, Zap } from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'

interface ProjectVitalityProps {
    updatedAt: string
    commitsCount: number
    logsCount: number
    techDebtScore: number
}

export default function ProjectVitality({ updatedAt, commitsCount, logsCount, techDebtScore }: ProjectVitalityProps) {
    // Calculate Vitality Score (0-10)
    const daysSinceLastUpdate = Math.max(0, (new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    const coolnessFactor = Math.max(0, 4 - daysSinceLastUpdate / 7)
    const progressFactor = Math.min(3, (commitsCount / 10) + (logsCount / 5))
    const debtPenalty = techDebtScore / 20

    const vitalityScore = Math.min(10, Math.max(0, coolnessFactor + progressFactor - debtPenalty + 3))

    const getStatusColor = (score: number) => {
        if (score > 8) return 'text-emerald-500'
        if (score > 5) return 'text-amber-500'
        return 'text-rose-500'
    }

    const getStatusGlow = (score: number) => {
        if (score > 8) return 'shadow-emerald-500/20'
        if (score > 5) return 'shadow-amber-500/20'
        return 'shadow-rose-500/20'
    }

    // Mock Heatmap Data (simple 4x7 grid representing 4 weeks)
    const heatmap = Array.from({ length: 28 }, (_, i) => Math.random() > 0.6 ? Math.floor(Math.random() * 3) + 1 : 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Flame className={`w-5 h-5 ${getStatusColor(vitalityScore)}`} />
                        <h3 className="text-sm font-black uppercase tracking-tighter text-gray-900">Score de Vitalité</h3>
                        <HelpTooltip
                            title="Score de Vitalité"
                            description="Indicateur de santé du projet calculé automatiquement. Prend en compte la fréquence des commits, le nombre de logs, et le niveau de dette technique."
                            steps={['Score > 8 = projet en excellente santé (vert)', 'Score entre 5-8 = activité modérée (orange)', 'Score < 5 = attention requise (rouge)']}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] leading-tight">Calculé en mesurant l'activité récente (commits/logs) moins la dette technique du projet.</p>
                </div>
                <div className={`text-2xl font-black ${getStatusColor(vitalityScore)} tabular-nums`}>
                    {vitalityScore.toFixed(1)}
                </div>
            </div>

            <div className="relative h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${vitalityScore * 10}%` }}
                    className={`h-full rounded-full ${vitalityScore > 7 ? 'bg-emerald-500' : vitalityScore > 4 ? 'bg-amber-500' : 'bg-rose-500'} shadow-lg ${getStatusGlow(vitalityScore)}`}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Fraîcheur</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900">
                        {daysSinceLastUpdate < 1 ? 'Mise à jour aujourd\'hui' : `Il y a ${Math.floor(daysSinceLastUpdate)}j`}
                    </p>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Activité</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900">
                        {commitsCount + logsCount} points
                    </p>
                </div>
            </div>

            {/* Micro Activity Heatmap */}
            <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>Pouls d'Activité</span>
                    <span>28 Derniers Jours</span>
                </div>
                <div className="grid grid-flow-col grid-rows-4 gap-1.5 h-16">
                    {heatmap.map((val, i) => (
                        <div
                            key={i}
                            className={`rounded-sm transition-all duration-500 ${val === 3 ? 'bg-emerald-500' : val === 2 ? 'bg-emerald-400' : val === 1 ? 'bg-emerald-200' : 'bg-gray-100'}`}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-[8px] text-gray-400">
                    <span>Moins</span>
                    <span>Plus d'activité</span>
                </div>
            </div>
        </div>
    )
}
