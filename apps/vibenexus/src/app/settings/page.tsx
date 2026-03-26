'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Shield, Webhook, Palette, Globe, Save, Loader2, Link, BellRing } from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import AppShell from '@/components/layout/AppShell'
import { getNexusSettings, updateNexusSettings } from '@/lib/queries'

export default function SettingsPage() {
    const [discordUrl, setDiscordUrl] = useState('')
    const [slackUrl, setSlackUrl] = useState('')
    const [vercelToken, setVercelToken] = useState('')
    const [sentryDsn, setSentryDsn] = useState('')
    const [groqKey, setGroqKey] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const settings = await getNexusSettings()
                if (settings) {
                    setDiscordUrl(settings.discord_webhook_url || '')
                    setSlackUrl(settings.slack_webhook_url || '')
                    setVercelToken(settings.vercel_token || '')
                    setSentryDsn(settings.sentry_dsn || '')
                    setGroqKey(settings.groq_api_key || '')
                }
            } catch (err) {
                console.error('Erreur chargement réglages:', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateNexusSettings({
                discord_webhook_url: discordUrl,
                slack_webhook_url: slackUrl,
                vercel_token: vercelToken,
                sentry_dsn: sentryDsn,
                groq_api_key: groqKey
            })
            alert('Réglages sauvegardés !')
        } catch (err) {
            console.error('Erreur sauvegarde:', err)
            alert('Erreur lors de la sauvegarde.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <AppShell><div className="p-20 text-center">Initialisation...</div></AppShell>
    }

    return (
        <AppShell>
            <div className="w-full px-6 sm:px-12 xl:px-24 py-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            ⚙️ Paramètres Nexus
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            Configuration du Centre de Commande et intégrations tierces.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder
                    </button>
                </motion.div>

                <div className="space-y-6">
                    {/* Webhooks Config */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl p-6 border"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <BellRing className="w-5 h-5 text-indigo-400" /> Notifications Externes
                            </h2>
                            <HelpTooltip
                                title="Notifications Externes"
                                description="Connectez vos serveurs Discord ou Slack pour recevoir des alertes automatiques de Nexus (état de santé, ADR, corrections, etc.)."
                                steps={['Copiez l\'URL du webhook depuis Discord ou Slack', 'Collez-la dans le champ correspondant', 'Cliquez sur Sauvegarder']}
                            />
                        </div>
                        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                            Recevez des alertes Nexus (Healthchecks, ADR, Auto-Fix) directement sur vos serveurs.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Discord Webhook URL</label>
                                <div className="relative">
                                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={discordUrl}
                                        onChange={(e) => setDiscordUrl(e.target.value)}
                                        placeholder="https://discord.com/api/webhooks/..."
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none font-mono"
                                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Slack Webhook URL</label>
                                <div className="relative">
                                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={slackUrl}
                                        onChange={(e) => setSlackUrl(e.target.value)}
                                        placeholder="https://hooks.slack.com/services/..."
                                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm outline-none font-mono"
                                        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* API Management */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl p-6 border"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Shield className="w-5 h-5 text-emerald-400" /> Clés API & Cloud
                            </h2>
                            <HelpTooltip
                                title="Clés API & Cloud"
                                description="Renseignez vos clés API pour activer les fonctionnalités avancées : déploiements Vercel, monitoring Sentry, et intelligence IA via Groq."
                                steps={['Récupérez votre clé API depuis le site du service', 'Collez-la dans le champ correspondant', 'Sauvegardez pour activer l\'intégration']}
                            />
                        </div>
                        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
                            Connectez vos outils de production pour activer les fonctions avancées (Déploiements, Observabilité).
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Vercel API Token (Read/Write)</label>
                                <input type="password" value={vercelToken} onChange={(e) => setVercelToken(e.target.value)}
                                    placeholder="sk_..." className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-mono"
                                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Sentry DSN (Observabilité)</label>
                                <input type="text" value={sentryDsn} onChange={(e) => setSentryDsn(e.target.value)}
                                    placeholder="https://...@sentry.io/..." className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-mono"
                                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                            </div>
                            <div>
                                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Groq API Key (Intelligence)</label>
                                <input type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)}
                                    placeholder="gsk_..." className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none font-mono"
                                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppShell>
    )
}

