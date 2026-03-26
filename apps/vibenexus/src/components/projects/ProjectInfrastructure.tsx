'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Terminal, FileCode, Copy, Loader2, Sparkles, Box, ShieldCheck, Zap, ShieldAlert, Check, Github } from 'lucide-react'

interface ProjectInfrastructureProps {
    project: any
    workspaceContext: any
    onRefresh?: () => void
}

export default function ProjectInfrastructure({ project, workspaceContext, onRefresh }: ProjectInfrastructureProps) {
    const [generating, setGenerating] = useState(false)
    const [infraData, setInfraData] = useState<any>(null)
    const [targetEnv, setTargetEnv] = useState('Docker')

    const [secResult, setSecResult] = useState<any>(null)
    const [secLoading, setSecLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'infra' | 'security'>('infra')

    const generateInfra = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/ai/infra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectContext: workspaceContext, targetEnv })
            })
            const data = await res.json()
            setInfraData(data)
        } catch (err) {
            console.error('Error generating infra:', err)
        } finally {
            setGenerating(false)
        }
    }

    const generateSecurity = async () => {
        setSecLoading(true)
        try {
            const res = await fetch('/api/ai/security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectContext: workspaceContext, requirements: ['Dependabot', 'SAST', 'Secret Scanning'] })
            })
            const data = await res.json()
            setSecResult(data)
        } catch (err) {
            console.error('Error generating security:', err)
        } finally {
            setSecLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Tab Switcher */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <button
                    onClick={() => setActiveTab('infra')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'infra' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                >
                    Infrastructure Engine
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'security' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                >
                    Security Scaffolding
                </button>
            </div>

            {activeTab === 'infra' ? (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <Cpu className="w-5 h-5 text-emerald-500" /> Deployment Assets
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Docker, CI/CD et configurations Cloud.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200">
                            {['Docker', 'Fly.io', 'Vercel'].map(env => (
                                <button
                                    key={env}
                                    onClick={() => setTargetEnv(env)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${targetEnv === env ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-700'}`}
                                >
                                    {env}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!infraData && !generating ? (
                        <div className="p-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-center space-y-4">
                            <Box className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Générer l'IA Infrastructure</h3>
                            <button
                                onClick={generateInfra}
                                className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white mx-auto shadow-lg shadow-emerald-500/20"
                            >
                                <Sparkles className="w-4 h-4" /> Configurer {targetEnv}
                            </button>
                        </div>
                    ) : generating ? (
                        <div className="p-20 text-center">
                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                            <p className="text-sm font-bold text-zinc-400">Génération de l'armature infrastructure...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                {infraData.files?.map((file: any, idx: number) => (
                                    <FileCard key={idx} file={file} color="emerald" project={project} />
                                ))}
                            </div>
                            <SidebarInfo data={infraData} color="emerald" />
                        </div>
                    )}
                </section>
            ) : (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <ShieldCheck className="w-5 h-5 text-orange-500" /> Hardening Security
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Armure DevSecOps pour vos pipelines GitHub.</p>
                        </div>
                    </div>

                    {!secResult && !secLoading ? (
                        <div className="p-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-center space-y-4">
                            <ShieldAlert className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Renforcement de Sécurité Automatique</h3>
                            <button
                                onClick={generateSecurity}
                                className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-orange-500 hover:bg-orange-600 text-white mx-auto shadow-lg shadow-orange-500/20"
                            >
                                <Zap className="w-4 h-4" /> Déployer l'Armure DevSecOps
                            </button>
                        </div>
                    ) : secLoading ? (
                        <div className="p-20 text-center">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
                            <p className="text-sm font-bold text-zinc-400">Audit de vulnérabilités et génération de workflows...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                {secResult.files?.map((file: any, idx: number) => (
                                    <FileCard key={idx} file={file} color="orange" project={project} />
                                ))}
                            </div>
                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl border bg-orange-500/5 border-orange-500/20">
                                    <h3 className="text-xs font-bold mb-3 text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Impact Sécurité
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-zinc-500">Amélioration Score</span>
                                            <span className="text-xs font-bold text-orange-500">+{secResult.securityScoreImpact}/10</span>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-50 border border-orange-200">
                                            <span className="text-[8px] uppercase font-bold text-orange-400 block mb-1">Mitigation Principale</span>
                                            <p className="text-[10px] text-gray-600 italic">"{secResult.vulnerabilityMitigated}"</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSecResult(null)}
                                    className="w-full py-3 rounded-2xl border border-gray-200 hover:border-gray-300 text-xs font-bold text-gray-500 hover:text-gray-700 transition-all"
                                >
                                    Relancer l'audit de sécurité
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}

function FileCard({ file, color, project }: { file: any, color: 'emerald' | 'orange', project: any }) {
    const [copied, setCopied] = useState(false)
    const [pushing, setPushing] = useState(false)
    const [pushed, setPushed] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const copy = () => {
        navigator.clipboard.writeText(file.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const pushToGitHub = async () => {
        if (!project.github_repo_full_name) return
        setPushing(true)
        setError(null)
        try {
            const res = await fetch('/api/github/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoFullName: project.github_repo_full_name,
                    branch: project.github_default_branch || 'master',
                    filePath: file.filePath,
                    content: file.content,
                    commitMessage: `feat(nexus): automate ${file.filePath} via Infrastructure Engine`
                })
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Échec du push')
            }
            setPushed(true)
            setTimeout(() => setPushed(false), 3000)
        } catch (err: any) {
            setError(err.message)
            setTimeout(() => setError(null), 5000)
        } finally {
            setPushing(false)
        }
    }

    const colorClasses = {
        emerald: { text: 'text-emerald-400', border: 'border-emerald-500/10', bg: 'bg-emerald-500/5', icon: 'text-emerald-400', button: 'bg-emerald-500 hover:bg-emerald-600' },
        orange: { text: 'text-orange-400', border: 'border-orange-500/10', bg: 'bg-orange-500/5', icon: 'text-orange-400', button: 'bg-orange-500 hover:bg-orange-600' }
    }

    const c = colorClasses[color]

    return (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileCode className={`w-4 h-4 ${c.icon}`} />
                    <span className="text-xs font-mono font-bold text-gray-700">{file.filePath}</span>
                </div>
                <div className="flex items-center gap-2">
                    {error && <span className="text-[9px] text-red-500 font-bold mr-2 truncate max-w-[100px]">{error}</span>}
                    <button
                        onClick={pushToGitHub}
                        disabled={pushing || !project.github_repo_full_name}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter text-white transition-all disabled:opacity-50 ${pushed ? 'bg-emerald-500' : c.button}`}
                    >
                        {pushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : pushed ? <Check className="w-3.5 h-3.5" /> : <Github className="w-3.5 h-3.5" />}
                        {pushed ? 'Pushé !' : 'Commit sur GitHub'}
                    </button>
                    <button onClick={copy} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <div className="p-4 bg-gray-50 overflow-x-auto">
                <pre className="text-[10px] font-mono text-gray-700 leading-relaxed whitespace-pre">
                    {file.content}
                </pre>
            </div>
            <div className={`px-4 py-2 ${c.bg} border-t ${c.border}`}>
                <p className={`text-[9px] ${c.text} opacity-70 italic`}>
                    <span className="font-bold uppercase not-italic mr-1">Rationale:</span> {file.explanation}
                </p>
            </div>
        </div>
    )
}

function SidebarInfo({ data, color }: { data: any, color: 'emerald' | 'orange' }) {
    return (
        <div className="space-y-4">
            <div className="p-5 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
                <h3 className="text-xs font-bold mb-3 flex items-center gap-2 text-emerald-400">
                    <Terminal className="w-4 h-4" /> Next Steps
                </h3>
                <ul className="space-y-2">
                    {data.nextSteps?.map((step: string, idx: number) => (
                        <li key={idx} className="flex gap-2 text-[10px] text-zinc-400">
                            <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-[8px] font-bold">{idx + 1}</span>
                            {step}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Préparation Infra</span>
                    <span className="text-xs font-bold text-emerald-500">{data.infrastructureScore}/10</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.infrastructureScore * 10}%` }} />
                </div>
            </div>
        </div>
    )
}
