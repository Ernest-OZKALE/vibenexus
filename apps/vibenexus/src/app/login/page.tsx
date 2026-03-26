'use client'

import { motion } from 'framer-motion'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const handleGitHubLogin = async () => {
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                scopes: 'repo',
            },
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm text-center"
            >
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="gradient-text">Nexus Engineering</span>
                    </h1>
                    <p className="text-sm tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>
                        System Workspace Authentication
                    </p>
                </div>

                {/* Login Card */}
                <div
                    className="rounded-2xl p-8 border"
                    style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    }}
                >
                    <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Identity Provider
                    </h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                        Authentification requise pour l&apos;analyse des dépôts et audits d&apos;architecture.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGitHubLogin}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: '#24292F' }}
                    >
                        <Github className="w-5 h-5" />
                        Continuer avec GitHub
                    </motion.button>

                    <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        L&apos;intégration GitHub permet l&apos;accès en lecture seule pour l&apos;analyse Staff Engineer IA.
                    </p>
                </div>

                {/* Security Footer */}
                <p className="mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                    Nexus Security Mesh v2.0<br />
                    Isolated Workspace Environment
                </p>
            </motion.div>
        </div>
    )
}
