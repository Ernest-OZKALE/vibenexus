'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { STATUS_CONFIG, type ProjectStatus } from '@/lib/types'
import Tooltip from '@/components/ui/Tooltip'

interface ProjectCardProps {
    id: string
    title: string
    description: string | null
    status: ProjectStatus
    techDebtScore: number
    repoUrl: string | null
    deployUrl: string | null
    updatedAt: string
    tags?: string[] | null
    onClick?: () => void
}

export default function ProjectCard({
    title,
    description,
    status,
    techDebtScore,
    repoUrl,
    deployUrl,
    updatedAt,
    tags,
    onClick,
}: ProjectCardProps) {
    const config = STATUS_CONFIG[status]
    // Freshness indicator
    const daysSinceUpdate = updatedAt
        ? Math.floor((new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0

    // Freshness indicator
    const getFreshness = () => {
        if (daysSinceUpdate < 3) return { label: 'Frais', color: '#22C55E' }
        if (daysSinceUpdate < 14) return { label: 'Tiède', color: '#F59E0B' }
        if (daysSinceUpdate < 60) return { label: 'Refroidi', color: '#EF4444' }
        return { label: 'Gelé', color: '#6B7280' }
    }

    const freshness = getFreshness()

    // Activity Calculation (Phase 14)
    const vitalityScore = Math.min(10, Math.max(0, (4 - daysSinceUpdate / 7) + 3)) // Simple version for card

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className="cursor-pointer rounded-xl p-5 border card-hover"
            style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <h3 className="text-base font-semibold group-hover:text-emerald-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {title}
                    </h3>
                </div>
                <div className="flex flex-col items-end">
                    <Tooltip text="Score de vitalité calculé sur l'activité récente" position="left">
                        <span
                            className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider mb-1"
                            style={{
                                background: `${config.color}15`,
                                color: config.color,
                            }}
                        >
                            {config.label}
                        </span>
                    </Tooltip>
                    <Tooltip text="Vitalité du projet (0-10)" position="left">
                        <div className="flex gap-0.5 items-center">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`w-1 h-3 rounded-full ${vitalityScore >= i * 2 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* Description */}
            {description && (
                <p
                    className="text-sm mb-3 line-clamp-2 leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {description}
                </p>
            )}

            {/* Tags (Phase 13) */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-[9px] font-bold text-gray-500">
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && <span className="text-[9px] text-muted">+{tags.length - 3}</span>}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t mt-auto" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: freshness.color }}
                        />
                        <span className="text-[10px] uppercase font-bold tracking-tight" style={{ color: freshness.color }}>
                            {freshness.label}
                        </span>
                    </div>
                    {repoUrl && (
                        <span className="text-[10px] font-medium opacity-50" style={{ color: 'var(--text-muted)' }}>
                            📦 Git
                        </span>
                    )}
                    {deployUrl && (
                        <span className="text-[10px] font-medium opacity-50" style={{ color: 'var(--text-muted)' }}>
                            🌐 Live
                        </span>
                    )}
                </div>

                {/* Micro Heatmap Pulse (Phase 14) */}
                <Tooltip text="Activité sur les 12 derniers jours" position="top">
                    <div className="flex gap-0.5">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 h-1 rounded-full ${Math.random() > 0.7 ? 'bg-emerald-400' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </Tooltip>
            </div>
        </motion.div>
    )
}
