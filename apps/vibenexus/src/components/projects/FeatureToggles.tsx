'use client'

import { useState } from 'react'
import { Settings2, CheckCircle2, Circle, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface FeatureTogglesProps {
    flags: Record<string, boolean> | null
    onSave: (flags: Record<string, boolean>) => void
}

const DEFAULT_FLAGS = {
    intelligence: true,
    autonomous_adr: true,
    webhooks: true,
    fleet: true,
    weekly_roundup: true
}

export default function FeatureToggles({ flags, onSave }: FeatureTogglesProps) {
    const [currentFlags, setCurrentFlags] = useState<Record<string, boolean>>(flags || DEFAULT_FLAGS)
    const [isSaving, setIsSaving] = useState(false)

    const toggleFeature = (key: string) => {
        const newFlags = { ...currentFlags, [key]: !currentFlags[key] }
        setCurrentFlags(newFlags)
        onSave(newFlags)

        // Visual feedback
        setIsSaving(true)
        setTimeout(() => setIsSaving(false), 1000)
    }

    const features = [
        { key: 'intelligence', label: 'IA Intelligence', desc: 'Audits accessibilité & performance' },
        { key: 'autonomous_adr', label: 'Autonomous ADR', desc: 'Génération auto de décisions techniques' },
        { key: 'webhooks', label: 'Smart Webhooks', desc: 'Notifications GitHub & Vercel' },
        { key: 'fleet', label: 'Fleet Command', icon: true, desc: 'Visible dans le dashboard de la flotte' },
        { key: 'weekly_roundup', label: 'Weekly Roundup', desc: 'Synthèses hebdomadaires IA' }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Feature Flags IA</h3>
                </div>
                {isSaving && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-emerald-500 font-bold uppercase italic"
                    >
                        Auto-Saved
                    </motion.span>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2">
                {features.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => toggleFeature(f.key)}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all text-left ${currentFlags[f.key]
                            ? 'bg-emerald-50 border-emerald-100 shadow-sm'
                            : 'bg-zinc-50 border-zinc-100 opacity-60'
                            }`}
                    >
                        <div className="flex flex-col">
                            <span className={`text-[11px] font-black uppercase tracking-tight ${currentFlags[f.key] ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                {f.label}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium leading-tight">
                                {f.desc}
                            </span>
                        </div>
                        {currentFlags[f.key] ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <Circle className="w-4 h-4 text-zinc-200" />
                        )}
                    </button>
                ))}
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 border-dashed">
                <div className="flex items-center gap-2 opacity-60">
                    <ShieldCheck className="w-3 h-3 text-zinc-400" />
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Nexus Security Mesh Active</span>
                </div>
            </div>
        </div>
    )
}
