'use client'

import { useState } from 'react'
import { Webhook, Copy, Check, ExternalLink } from 'lucide-react'

interface WebhookHelperProps {
    projectId: string
}

export default function WebhookHelper({ projectId }: WebhookHelperProps) {
    const [copied, setCopied] = useState(false)
    const [source, setSource] = useState<'github' | 'vercel'>('github')

    const nexusUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vibenexus.vercel.app'
    const webhookUrl = `${nexusUrl}/api/webhooks/nexus?projectId=${projectId}&source=${source}`

    const handleCopy = () => {
        navigator.clipboard.writeText(webhookUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Webhooks Intelligents</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSource('github')}
                        className={`text-[10px] font-black px-2 py-0.5 rounded transition-all ${source === 'github' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}
                    >
                        GitHub
                    </button>
                    <button
                        onClick={() => setSource('vercel')}
                        className={`text-[10px] font-black px-2 py-0.5 rounded transition-all ${source === 'vercel' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}
                    >
                        Vercel
                    </button>
                </div>
            </div>

            <div className="p-4 rounded-xl border bg-white border-zinc-200 space-y-3 shadow-premium">
                <div className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                    <p className="font-bold text-zinc-800 mb-2">Tutoriel Rapide :</p>
                    {source === 'github' ? (
                        <ol className="list-decimal pl-4 space-y-1">
                            <li>Allez dans les <strong>Settings</strong> de votre dépôt GitHub.</li>
                            <li>Cliquez sur <strong>Webhooks</strong> puis <strong>Add webhook</strong>.</li>
                            <li>Copiez l'URL ci-dessous dans <strong>Payload URL</strong>.</li>
                            <li>Vérifiez que le Content-Type est <strong>application/json</strong>.</li>
                            <li>Choisissez <strong>"Send me everything"</strong> et sauvegardez.</li>
                        </ol>
                    ) : (
                        <ol className="list-decimal pl-4 space-y-1">
                            <li>Allez dans les <strong>Settings</strong> de votre projet Vercel.</li>
                            <li>Cliquez sur <strong>Webhooks</strong>.</li>
                            <li>Copiez l'URL ci-dessous et ajoutez-la.</li>
                            <li>Sélectionnez les évènements de déploiement (Deployment completed/error).</li>
                        </ol>
                    )}
                </div>

                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 group">
                    <code className="text-[10px] text-zinc-500 font-mono truncate flex-1">
                        {webhookUrl}
                    </code>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-emerald-500 transition-all"
                        title="Copier l'URL"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>

                <a
                    href={source === 'github' ? 'https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks' : 'https://vercel.com/docs/integrations/webhooks'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[9px] text-zinc-600 hover:text-zinc-400 font-bold uppercase tracking-wider"
                >
                    Documentation <ExternalLink className="w-2.5 h-2.5" />
                </a>
            </div>
        </div>
    )
}
