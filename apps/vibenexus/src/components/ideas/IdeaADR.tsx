'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Loader2, Database, Network, Layers, Clock, AlertCircle, Github, Check, Search, Hexagon } from 'lucide-react'
import Mermaid from '@/components/ui/Mermaid'

interface ADRData {
    title: string
    executiveSummary: string
    architectureDiagram: string
    databaseSchema: { table: string, description: string, columns: string[] }[]
    apiEndpoints: { method: string, path: string, purpose: string }[]
    techStack: { category: string, technology: string, reason: string }[]
    estimatedEffort: string
}

export default function IdeaADR({ ideaContent }: { ideaContent: string }) {
    const [adr, setAdr] = useState<ADRData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPushing, setIsPushing] = useState(false)
    const [pushSuccess, setPushSuccess] = useState(false)
    const [showPushSelector, setShowPushSelector] = useState(false)
    const [repos, setRepos] = useState<any[]>([])
    const [repoSearch, setRepoSearch] = useState('')
    const [loadingRepos, setLoadingRepos] = useState(false)

    const generateADR = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/innovation/spec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ideaContent })
            })

            if (!res.ok) throw new Error('Failed to generate Architecture Decision Record')

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setAdr(data.adr)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    const loadRepos = async () => {
        setLoadingRepos(true)
        try {
            const res = await fetch('/api/github/repos')
            const data = await res.json()
            setRepos(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Error loading repos:', err)
        } finally {
            setLoadingRepos(false)
        }
    }

    const pushToGitHub = async (repo: any) => {
        if (!adr) return
        setIsPushing(true)
        setError(null)
        try {
            const date = new Date().toISOString().split('T')[0]
            const fileName = `docs/adr/${date}-${adr.title.toLowerCase().replace(/\s+/g, '-')}.md`

            const content = `# ADR: ${adr.title}

## Résumé Exécutif
${adr.executiveSummary}

## Stack Technique
${adr.techStack.map(t => `- **${t.category}**: ${t.technology} (${t.reason})`).join('\n')}

## Endpoints API
${adr.apiEndpoints.map(e => `- **${e.method}** ${e.path}: ${e.purpose}`).join('\n')}

## Schéma de Base de Données
${adr.databaseSchema.map(s => `### Table: ${s.table}\n${s.description}\n**Colonnes:** ${s.columns.join(', ')}`).join('\n\n')}

## Diagramme d'Architecture
\`\`\`mermaid
${adr.architectureDiagram}
\`\`\`

## Effort Estimé
${adr.estimatedEffort}

---
*Généré par Nexus Engineering Command Center*
`

            const res = await fetch('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoFullName: repo.full_name,
                    branch: repo.default_branch,
                    filePath: fileName,
                    content: content,
                    commitMessage: `docs: add ADR for ${adr.title}`
                })
            })

            if (!res.ok) throw new Error('Échec du commit sur GitHub')

            setPushSuccess(true)
            setShowPushSelector(false)
            setTimeout(() => setPushSuccess(false), 5000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsPushing(false)
        }
    }

    const filteredRepos = repos.filter(r =>
        r.full_name.toLowerCase().includes(repoSearch.toLowerCase())
    ).slice(0, 5)

    if (!adr && !loading && !error) {
        return (
            <button
                onClick={generateADR}
                className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                style={{
                    background: 'var(--bg-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)'
                }}
            >
                <FileText className="w-3.5 h-3.5" />
                Générer RFC / Architecture (IA)
            </button>
        )
    }

    if (loading) {
        return (
            <div className="mt-4 p-4 rounded-xl border flex items-center gap-3" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent-purple)' }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Le Senior Architect (Llama 3) rédige les spécifications...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mt-4 p-3 rounded-lg flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4" /> {error}
            </div>
        )
    }

    if (!adr) return null

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-5 rounded-xl border border-dashed relative overflow-hidden"
            style={{ background: 'var(--bg-card)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
        >
            <div className="absolute top-0 right-0 p-3 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-purple-500/10 text-purple-500">
                    Auto-Generated ADR
                </span>
            </div>

            <h3 className="text-lg font-bold mb-2 pr-24" style={{ color: 'var(--text-primary)' }}>{adr.title}</h3>
            <p className="text-sm mb-6 pb-4 border-b" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}>
                {adr.executiveSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tech Stack */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Layers className="w-3.5 h-3.5 text-blue-500" /> Stack Technique
                    </h4>
                    <div className="space-y-2">
                        {adr.techStack.map((tech, idx) => (
                            <div key={idx} className="p-2 rounded border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{tech.technology}</span>
                                    <span className="text-[10px] text-gray-500 uppercase">{tech.category}</span>
                                </div>
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tech.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* API & Effort */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Network className="w-3.5 h-3.5 text-green-500" /> API Endpoints
                        </h4>
                        <div className="space-y-1">
                            {adr.apiEndpoints.map((api, idx) => (
                                <div key={idx} className="flex flex-col p-2 rounded text-xs border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                                    <div className="flex gap-2 mb-1">
                                        <span className={`font-mono font-bold ${api.method === 'GET' ? 'text-blue-500' : api.method === 'POST' ? 'text-green-500' : api.method === 'DELETE' ? 'text-red-500' : 'text-yellow-500'}`}>
                                            {api.method}
                                        </span>
                                        <span className="font-mono text-gray-500">{api.path}</span>
                                    </div>
                                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{api.purpose}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded border" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                        <Clock className="w-4 h-4 text-orange-500" />
                        <div>
                            <p className="text-[10px] uppercase font-semibold text-orange-500">Effort Estimé</p>
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{adr.estimatedEffort}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Database Schema */}
            <div className="mt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Database className="w-3.5 h-3.5 text-purple-500" /> Schéma de Données
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {adr.databaseSchema.map((schema, idx) => (
                        <div key={idx} className="flex-shrink-0 w-64 p-3 rounded border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{schema.table}</p>
                            <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>{schema.description}</p>
                            <ul className="space-y-1">
                                {schema.columns.map((col, i) => (
                                    <li key={i} className="text-[10px] font-mono p-1 rounded bg-gray-50" style={{ color: 'var(--text-secondary)' }}>
                                        {col}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Diagram Rendering */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2">
                    <Hexagon className="w-4 h-4 text-purple-500" />
                    <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Architecture Blueprint</h4>
                </div>
                <Mermaid id={`mermaid-${adr.title.replace(/\s+/g, '-')}`} chart={adr.architectureDiagram} />
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-zinc-500 italic">Visualisation générée par le Nexus Intelligence Engine.</p>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(adr.architectureDiagram);
                            alert('Code Mermaid copié !');
                        }}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold transition-colors"
                    >
                        Copier le code source
                    </button>
                </div>
            </div>

            {/* GitHub Push Action */}
            <div className="mt-8 pt-6 border-t border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
                {!showPushSelector ? (
                    <button
                        onClick={() => { setShowPushSelector(true); loadRepos(); }}
                        disabled={isPushing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-gray-100 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-700"
                    >
                        {pushSuccess ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ADR Envoyé sur GitHub !
                            </>
                        ) : (
                            <>
                                <Github className="w-3.5 h-3.5" />
                                Exporter vers un Dépôt GitHub
                            </>
                        )}
                    </button>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-zinc-500">Sélectionner le dépôt cible</span>
                            <button onClick={() => setShowPushSelector(false)} className="text-[10px] text-gray-500 hover:text-gray-900">Annuler</button>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-50" style={{ borderColor: 'var(--border-subtle)' }}>
                            <Search className="w-3 h-3 text-zinc-600" />
                            <input
                                type="text"
                                placeholder="Rechercher un repo..."
                                value={repoSearch}
                                onChange={(e) => setRepoSearch(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-xs text-gray-900"
                            />
                        </div>
                        <div className="space-y-1">
                            {loadingRepos ? (
                                <div className="flex items-center gap-2 py-2 text-[10px] text-zinc-500">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Chargement de vos dépôts...
                                </div>
                            ) : filteredRepos.length > 0 ? (
                                filteredRepos.map(repo => (
                                    <button
                                        key={repo.id}
                                        onClick={() => pushToGitHub(repo)}
                                        disabled={isPushing}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-300 transition-all text-left"
                                    >
                                        <span className="text-[11px] text-gray-600 truncate">{repo.full_name}</span>
                                        {isPushing ? <Loader2 className="w-3 h-3 animate-spin text-zinc-600" /> : <Github className="w-3 h-3 text-zinc-600" />}
                                    </button>
                                ))
                            ) : (
                                <p className="text-[10px] text-zinc-600 py-2">Aucun dépôt trouvé.</p>
                            )}
                        </div>
                        <p className="text-[9px] text-zinc-500">L&apos;ADR sera créé dans `docs/adr/` sur la branche par défaut.</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
