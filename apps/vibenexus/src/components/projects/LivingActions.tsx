import { Github, ExternalLink, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

interface LivingActionsProps {
    projectId: string
    repoUrl: string | null
    deployUrl: string | null
}

export default function LivingActions({ repoUrl, deployUrl }: LivingActionsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
                whileHover={repoUrl ? { scale: 1.02, y: -2 } : {}}
                whileTap={repoUrl ? { scale: 0.98 } : {}}
                onClick={() => repoUrl && window.open(repoUrl, '_blank')}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${!repoUrl ? 'opacity-40 cursor-not-allowed' : ''}`}
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
            >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-gray-200 transition-colors">
                    <Github className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Dépôt GitHub</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">Accéder au code source</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 absolute top-5 right-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
                whileHover={deployUrl ? { scale: 1.02, y: -2 } : {}}
                whileTap={deployUrl ? { scale: 0.98 } : {}}
                onClick={() => deployUrl && window.open(deployUrl, '_blank')}
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${!deployUrl ? 'opacity-40 cursor-not-allowed' : ''}`}
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
            >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Globe className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Version en Ligne</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">Voir le projet en production</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 absolute top-5 right-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
        </div>
    )
}
