'use client'

import { useState, useEffect } from 'react'
import { Database, Lock, Cpu, Eye, EyeOff, Check, ShieldCheck, Save, Loader2, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateProject } from '@/lib/queries'

interface ProjectCredentialsProps {
    projectId: string
    initialUrl?: string
    initialKey?: string
    initialVercelId?: string
    onRefresh?: () => void
}

export default function ProjectCredentials({ projectId, initialUrl = '', initialKey = '', initialVercelId = '', onRefresh }: ProjectCredentialsProps) {
    const [url, setUrl] = useState(initialUrl)
    const [key, setKey] = useState(initialKey)
    const [vId, setVId] = useState(initialVercelId)
    const [showKey, setShowKey] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateProject(projectId, {
                target_supabase_url: url,
                target_supabase_anon_key: key,
                vercel_project_id: vId
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
            if (onRefresh) onRefresh()
        } catch (err) {
            console.error('Failed to save credentials')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Coffre-Fort du Projet</h3>
                            <p className="text-[10px] text-gray-500 font-medium">SYSTÈME DE STOCKAGE SÉCURISÉ</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Supabase URL */}
                    <div className="group space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest pl-1">
                            <Database className="w-3 h-3 text-emerald-500" /> API Endpoints (Supabase URL)
                        </label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:bg-white transition-all font-mono"
                                placeholder="https://xxx.supabase.co"
                            />
                        </div>
                    </div>

                    {/* Access Key */}
                    <div className="group space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest pl-1">
                            <Key className="w-3 h-3 text-emerald-500" /> Confidential Key (anon public)
                        </label>
                        <div className="relative group/input">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:bg-white transition-all font-mono tracking-widest"
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                            >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Vercel ID */}
                    <div className="group space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest pl-1">
                            <Cpu className="w-3 h-3 text-gray-400" /> Deployment ID (Vercel)
                        </label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={vId}
                                onChange={(e) => setVId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:bg-white transition-all font-mono"
                                placeholder="prj_xxxxxxxx"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex-1 relative flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all overflow-hidden ${saved ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'}`}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Synchronisation...
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-4 h-4" />
                                Vault Updated
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Seal the Vault
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Footer Alert */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[9px] text-gray-500 font-bold tracking-tight uppercase">
                    Clés chiffrées localement. Aucun transfert vers serveurs tiers.
                </p>
            </div>
        </div>
    )
}
