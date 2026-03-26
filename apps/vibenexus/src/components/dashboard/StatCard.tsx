'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatCardProps {
    label: string
    value: string | number
    icon: ReactNode
    color: string
    subtitle?: string
}

export default function StatCard({ label, value, icon, color, subtitle }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="rounded-xl p-5 border"
            style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="p-2.5 rounded-lg"
                    style={{ background: `${color}15` }}
                >
                    <div style={{ color }}>{icon}</div>
                </div>
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                {value}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {label}
            </div>
            {subtitle && (
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {subtitle}
                </div>
            )}
        </motion.div>
    )
}
