import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Rocket, Lightbulb, Settings, Terminal, Command, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getProjects, getIdeas } from '@/lib/queries'
import { Project, Idea } from '@/lib/types'

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<{ type: 'project' | 'idea' | 'action', id: string, title: string, subtitle?: string }[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const router = useRouter()

    const loadData = useCallback(async () => {
        try {
            const [p, i] = await Promise.all([getProjects(), getIdeas()])
            setProjects(p)
            setIdeas(i)
        } catch (err) {
            console.error('Failed to load command palette data')
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
                loadData()
            }
            if (e.key === 'Escape') setIsOpen(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [loadData])

    useEffect(() => {
        if (!isOpen) return

        const staticActions = [
            { type: 'action' as const, id: 'settings', title: 'Accéder aux réglages', subtitle: 'Config integrations & keys' },
            { type: 'action' as const, id: 'new-project', title: 'Créer un nouveau projet', subtitle: 'Start something big' }
        ]

        const filteredProjects = projects
            .filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
            .map(p => ({ type: 'project' as const, id: p.id, title: p.title, subtitle: 'Projet Nexus' }))

        const filteredIdeas = ideas
            .filter(i => i.content.toLowerCase().includes(query.toLowerCase()))
            .map(i => ({ type: 'idea' as const, id: i.id, title: i.content, subtitle: 'Innovation Lab' }))

        const all = [...staticActions, ...filteredProjects, ...filteredIdeas]
            .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))

        setResults(all)
        setSelectedIndex(0)
    }, [query, projects, ideas, isOpen])

    const handleSelect = (item: typeof results[0]) => {
        if (item.type === 'project') router.push(`/projects/${item.id}`)
        if (item.type === 'idea') router.push('/ideas') // Focus state would be better but for now focus on page
        if (item.id === 'settings') router.push('/settings')
        if (item.id === 'new-project') router.push('/projects') // Would open modal usually
        setIsOpen(false)
        setQuery('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % results.length)
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
        }
        if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex])
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-white/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden"
                        onKeyDown={handleKeyDown}
                    >
                        <div className="flex items-center gap-3 px-4 h-16 border-b border-zinc-100">
                            <Search className="w-5 h-5 text-zinc-400" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Tapez une commande ou recherchez un projet..."
                                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-50 text-[10px] font-bold text-zinc-400 border border-zinc-100">
                                <Command className="w-3 h-3" /> K
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {results.length === 0 ? (
                                <div className="py-12 text-center text-zinc-500 text-xs">
                                    Aucun résultat pour &quot;{query}&quot;
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {results.map((item, index) => (
                                        <button
                                            key={`${item.type}-${item.id}`}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${index === selectedIndex ? 'bg-emerald-50 border border-emerald-100' : 'border border-transparent hover:bg-zinc-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${item.type === 'project' ? 'bg-blue-500/10 text-blue-500' :
                                                    item.type === 'idea' ? 'bg-amber-500/10 text-amber-500' :
                                                        'bg-zinc-700/50 text-zinc-400'
                                                    }`}>
                                                    {item.type === 'project' ? <Rocket className="w-4 h-4" /> :
                                                        item.type === 'idea' ? <Lightbulb className="w-4 h-4" /> :
                                                            item.id === 'settings' ? <Settings className="w-4 h-4" /> :
                                                                <Terminal className="w-4 h-4" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">{item.subtitle}</p>
                                                </div>
                                            </div>
                                            {index === selectedIndex && (
                                                <span className="text-[10px] text-emerald-500 font-bold">ENTRER</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] text-zinc-400">
                                <span className="flex items-center gap-1"><span className="px-1 py-0.5 rounded bg-white border border-zinc-200 text-zinc-400">↑↓</span> Naviguer</span>
                                <span className="flex items-center gap-1"><span className="px-1 py-0.5 rounded bg-white border border-zinc-200 text-zinc-400">ESC</span> Fermer</span>
                            </div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">VibeNexus Command Hub</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
