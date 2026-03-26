'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Loader2, CheckCircle2, AlertCircle, Bookmark, Share2 } from 'lucide-react'

interface ADRData {
    title: string
    context: string
    decision: string
    consequences: string
    status: 'PROPOSED' | 'ACCEPTED' | 'SUPERSEDED'
    severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface AutonomousADRProps {
    projectTitle: string
    logs: any[]
    commits: any[]
}

export default function AutonomousADR({ projectTitle, logs, commits }: AutonomousADRProps) {
    const [adr, setAdr] = useState<ADRData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateADR = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/adr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs, commits, projectTitle })
            })
            if (!res.ok) throw new Error('Failed to generate ADR')
            const data = await res.json()
            setAdr(data)
        } catch (err) {
            setError("L'IA n'a pas pu extraire de décision claire des données récentes.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">ADR Autonomes</h3>
                </div>
                {!adr && !loading && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generateADR}
                        className="text-[10px] font-black uppercase tracking-tighter text-emerald-500 hover:text-emerald-400"
                    >
                        Générer
                    </motion.button>
                )}
            </div>

            <div className="relative min-h-[100px] p-4 rounded-xl border bg-white border-zinc-200">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-6 gap-2"
                        >
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">Analyse des décisions...</span>
                        </motion.div>
                    ) : adr ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <h4 className="text-sm font-black text-zinc-900 italic leading-tight">{adr.title}</h4>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${adr.severity === 'HIGH' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                                    adr.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                                        'bg-zinc-100 text-zinc-500 border border-zinc-200'
                                    }`}>
                                    {adr.severity}
                                </span>
                            </div>

                            <div className="grid gap-3">
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Contexte</p>
                                    <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">{adr.context}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1 text-emerald-600">Décision Acceptée</p>
                                    <p className="text-[11px] text-zinc-900 leading-relaxed font-bold">{adr.decision}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Conséquences</p>
                                    <p className="text-[11px] text-zinc-500 italic leading-relaxed">{adr.consequences}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500/50 uppercase italic">
                                    <CheckCircle2 className="w-3 h-3" /> Généré par l'IA
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setAdr(null)} className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-600">
                                        <Share2 className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => setAdr(null)} className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-rose-500">
                                        <Bookmark className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center p-4 py-8 text-center gap-2">
                            <AlertCircle className="w-5 h-5 text-zinc-700" />
                            <p className="text-[10px] text-zinc-600 font-medium">{error}</p>
                            <button onClick={generateADR} className="text-[9px] underline text-emerald-500 mt-1">Réessayer</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 py-6 text-center gap-2">
                            <Gavel className="w-5 h-5 text-zinc-800" />
                            <p className="text-[10px] text-zinc-600 font-bold mb-1">Qu'est-ce qu'un ADR ?</p>
                            <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[200px]">
                                Un <strong>Architectural Decision Record</strong> documente formellement les choix techniques.
                                <br />L'IA les extrait automatiquement de vos commits et de votre journal de bord !
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
