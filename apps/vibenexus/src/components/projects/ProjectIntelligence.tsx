'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Server, Map, Wrench, Loader2, Play, Zap, ExternalLink } from 'lucide-react'
import { Project } from '@/lib/types'

interface AIAnalysis {
    systemArchitecture: { title: string, description: string, impact: string, securityLink?: string }[]
    security: { title: string, description: string, severity: string, cveReference?: string }[]
    roadmap: { feature: string, rationale: string, complexity: string }[]
    devops: { practice: string, description: string, link?: string }[]
    accessibility: { issue: string, description: string, severity: string }[]
    performance: { optimization: string, impact: string, benefit: string }[]
}

export default function ProjectIntelligence({ project }: { project: Project }) {
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Auto-fix states
    const [fixingItem, setFixingItem] = useState<string | null>(null)
    const [fixedPrUrls, setFixedPrUrls] = useState<Record<string, string>>({})

    const runAudit = async () => {
        if (!project.github_repo_full_name || !project.github_default_branch) {
            setError('Veuillez lier un dépôt GitHub pour lancer l\'audit Staff Engineer.')
            return
        }

        setLoading(true)
        setError(null)
        setAnalysis(null)

        try {
            // 1. Fetch Workspace Context
            const wsRes = await fetch(`/api/github/workspace?repo=${project.github_repo_full_name}&branch=${project.github_default_branch}`)

            if (!wsRes.ok) {
                throw new Error('Échec de la récupération du contexte workspace GitHub')
            }
            const { context } = await wsRes.json()

            // 2. Run Groq Inference (Nexus AI Analyze)
            const aiRes = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceContext: context })
            })

            if (!aiRes.ok) {
                const errorData = await aiRes.json()
                throw new Error(errorData.error || 'Échec du traitement de l\'analyse AI')
            }

            const { analysis: result } = await aiRes.json()
            setAnalysis(result)

        } catch (err: any) {
            setError(err.message || 'Une erreur inattendue est survenue lors de l\'audit.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (project.github_repo_full_name && !analysis && !loading && !error) {
            runAudit()
        }
    }, [project.github_repo_full_name])

    const handleAutoFix = async (itemTitle: string, itemDescription: string) => {
        if (!project.github_repo_full_name || !project.github_default_branch) return

        setFixingItem(itemTitle)
        setError(null)
        try {
            const res = await fetch('/api/github/pr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoFullName: project.github_repo_full_name,
                    defaultBranch: project.github_default_branch,
                    issueTitle: itemTitle,
                    issueDescription: itemDescription
                })
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to auto-fix issue')
            }

            const data = await res.json()
            if (data.prUrl) {
                setFixedPrUrls(prev => ({ ...prev, [itemTitle]: data.prUrl }))
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown auto-fix error')
        } finally {
            setFixingItem(null)
        }
    }

    if (!project.github_repo_full_name) {
        return (
            <div className="p-8 text-center border rounded-xl" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
                <Server className="w-10 h-10 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>GitHub Connection Required</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Nexus Intelligence Core requires a linked repository to perform Staff Engineer audits.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Nexus Intelligence Core</h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Automated Staff Engineer Technical Audit</p>
                </div>
                <button
                    onClick={runAudit}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                        background: loading ? 'var(--bg-elevated)' : '#10B981',
                        color: loading ? 'var(--text-muted)' : '#FFF'
                    }}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {loading ? 'Analyzing Workspace...' : 'Run Full Audit'}
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {loading && (
                <div className="p-10 border border-dashed rounded-xl flex flex-col items-center justify-center" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="w-12 h-12 mb-4 rounded-full border-2 border-t-emerald-500 animate-spin" style={{ borderColor: 'var(--border-subtle) var(--border-subtle) var(--border-subtle) #10B981' }}></div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Extracting AST and Repository Context...</p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Llama 3.1 is auditing architecture, security, and roadmap.</p>
                </div>
            )}

            {analysis && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Architecture */}
                    <div className="p-5 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Server className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Architecture Système</h3>
                        </div>
                        <ul className="space-y-4">
                            {analysis.systemArchitecture.map((item, idx) => (
                                <li key={idx} className="text-sm p-3 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="font-medium flex items-center justify-between mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {item.title}
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">{item.impact} IMPACT</span>
                                    </span>
                                    <p className="mb-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>

                                    {fixedPrUrls[item.title] ? (
                                        <a href={fixedPrUrls[item.title]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 font-medium hover:underline">
                                            ✅ PR Created <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => handleAutoFix(item.title, item.description)}
                                            disabled={fixingItem !== null}
                                            className="mt-2 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors"
                                            style={{
                                                background: fixingItem === item.title ? 'transparent' : 'rgba(59, 130, 246, 0.1)',
                                                color: '#3B82F6',
                                                border: '1px solid rgba(59, 130, 246, 0.2)'
                                            }}
                                        >
                                            {fixingItem === item.title ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Coding Fix...</>
                                            ) : (
                                                <><Zap className="w-3.5 h-3.5" /> Auto-Fix</>
                                            )}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Security */}
                    <div className="p-5 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Security & Compliance</h3>
                        </div>
                        <ul className="space-y-4">
                            {analysis.security.map((item, idx) => (
                                <li key={idx} className="text-sm p-3 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="font-medium flex items-center justify-between mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {item.title}
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">{item.severity} SEVERITY</span>
                                    </span>
                                    <p className="mb-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>

                                    {item.cveReference && (
                                        <a href={item.cveReference} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-red-400 font-mono mb-3 p-2 rounded bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                            <ShieldAlert className="w-3 h-3" /> {item.cveReference.includes('http') ? 'Documentation de Vulnérabilité' : item.cveReference}
                                        </a>
                                    )}

                                    {fixedPrUrls[item.title] ? (
                                        <a href={fixedPrUrls[item.title]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-red-400 font-medium hover:underline">
                                            ✅ PR Created <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => handleAutoFix(item.title, item.description)}
                                            disabled={fixingItem !== null}
                                            className="mt-2 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors"
                                            style={{
                                                background: fixingItem === item.title ? 'transparent' : 'rgba(239, 68, 68, 0.1)',
                                                color: '#EF4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)'
                                            }}
                                        >
                                            {fixingItem === item.title ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing Patch...</>
                                            ) : (
                                                <><Zap className="w-3.5 h-3.5" /> Auto-Fix</>
                                            )}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Roadmap */}
                    <div className="p-5 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Map className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Feuille de Route Technique</h3>
                        </div>
                        <ul className="space-y-4">
                            {analysis.roadmap.map((item, idx) => (
                                <li key={idx} className="text-sm">
                                    <span className="font-medium flex items-center justify-between mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {item.feature}
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">{item.complexity} EFFORT</span>
                                    </span>
                                    <p style={{ color: 'var(--text-muted)' }}>{item.rationale}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* DevOps */}
                    <div className="p-5 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Wrench className="w-5 h-5 text-orange-500" />
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Maintenance & DevOps</h3>
                        </div>
                        <ul className="space-y-4">
                            {analysis.devops.map((item, idx) => (
                                <li key={idx} className="text-sm p-3 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>{item.practice}</span>
                                    <p className="mb-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>

                                    {item.link && (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mb-3 text-[10px] text-orange-400 font-medium hover:underline">
                                            <ExternalLink className="w-3 h-3" /> Best Practices Guide
                                        </a>
                                    )}

                                    {fixedPrUrls[item.practice] ? (
                                        <a href={fixedPrUrls[item.practice]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-orange-400 font-medium hover:underline">
                                            ✅ PR Created <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => handleAutoFix(item.practice, item.description)}
                                            disabled={fixingItem !== null}
                                            className="mt-2 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors"
                                            style={{
                                                background: fixingItem === item.practice ? 'transparent' : 'rgba(249, 115, 22, 0.1)',
                                                color: '#f97316',
                                                border: '1px solid rgba(249, 115, 22, 0.2)'
                                            }}
                                        >
                                            {fixingItem === item.practice ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fixing Ops...</>
                                            ) : (
                                                <><Zap className="w-3.5 h-3.5" /> Auto-Fix</>
                                            )}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Accessibility */}
                    <div className="p-5 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-5 h-5 text-purple-500" />
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Accessibility (A11y)</h3>
                        </div>
                        <ul className="space-y-4">
                            {analysis.accessibility?.map((item, idx) => (
                                <li key={idx} className="text-sm p-3 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="font-medium flex items-center justify-between mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {item.issue}
                                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${item.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                            {item.severity} SEVERITY
                                        </span>
                                    </span>
                                    <p style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Performance */}
                    <div className="p-5 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Performance & Core Web Vitals</h3>
                        </div>
                        <ul className="space-y-4">
                            {analysis.performance?.map((item, idx) => (
                                <li key={idx} className="text-sm p-3 rounded-lg border bg-black/20" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="font-medium flex items-center justify-between mb-1" style={{ color: 'var(--text-primary)' }}>
                                        {item.optimization}
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">{item.impact} IMPACT</span>
                                    </span>
                                    <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>{item.benefit}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
