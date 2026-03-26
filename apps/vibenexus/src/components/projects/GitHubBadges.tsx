import { Github } from 'lucide-react'

interface GitHubBadgesProps {
    repoFullName: string | null
    defaultBranch: string
}

export default function GitHubBadges({ repoFullName, defaultBranch }: GitHubBadgesProps) {
    if (!repoFullName) return null

    const baseUrl = `https://github.com/${repoFullName}/actions/workflows`

    const badges = [
        { name: 'Build', file: 'build.yml' },
        { name: 'Tests', file: 'test.yml' },
        { name: 'Lint', file: 'lint.yml' }
    ]

    return (
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border bg-black/20 border-zinc-800/50">
            <div className="w-full flex items-center gap-2 mb-2">
                <Github className="w-3.5 h-3.5 text-zinc-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Statut Pipeline CI/CD</h4>
            </div>

            <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                    <div key={badge.name} className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase ml-1">{badge.name}</span>
                        <img
                            src={`https://github.com/${repoFullName}/actions/workflows/${badge.file}/badge.svg?branch=${defaultBranch}`}
                            alt={`${badge.name} Status`}
                            className="h-5 rounded opacity-80 hover:opacity-100 transition-opacity cursor-help"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
