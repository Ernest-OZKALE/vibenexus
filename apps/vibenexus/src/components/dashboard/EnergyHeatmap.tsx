'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Activity } from 'lucide-react'
import { getEvents } from '@/lib/queries'

export default function EnergyHeatmap() {
    const [stats, setStats] = useState<number[]>(new Array(7).fill(0))
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadHeatmap() {
            try {
                const events = await getEvents()
                const dayCounts = new Array(7).fill(0)
                const now = new Date()

                events.forEach(ev => {
                    const evDate = new Date(ev.created_at)
                    const diffDays = Math.floor((now.getTime() - evDate.getTime()) / (1000 * 3600 * 24))
                    if (diffDays >= 0 && diffDays < 7) {
                        dayCounts[6 - diffDays]++
                    }
                })
                setStats(dayCounts)
            } catch (err) {
                console.error('Heatmap error:', err)
            } finally {
                setLoading(false)
            }
        }
        loadHeatmap()
    }, [])

    const maxActivity = Math.max(...stats, 1)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2 text-zinc-500">
                    <Activity className="w-4 h-4 text-amber-500" /> Intensité Nexus (7j)
                </h3>
                <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-zinc-400">{stats.reduce((a, b) => a + b, 0)} events</span>
                </div>
            </div>

            <div className="flex items-end gap-1.5 h-12">
                {stats.map((count, i) => {
                    const height = (count / maxActivity) * 100
                    const intensity = count > 0 ? Math.min(0.2 + (count / maxActivity) * 0.8, 1) : 0.05

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(height, 5)}%` }}
                                className="w-full rounded-t-sm transition-all duration-500"
                                style={{
                                    background: `rgba(245, 158, 11, ${intensity})`,
                                    boxShadow: count > 0 ? `0 0 10px rgba(245, 158, 11, ${intensity * 0.5})` : 'none'
                                }}
                            />
                            {count > 0 && (
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-50 text-[8px] font-bold px-1.5 py-0.5 rounded border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-gray-700">
                                    {count}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">
                <span>J-7</span>
                <span>Aujourd'hui</span>
            </div>
        </div>
    )
}
