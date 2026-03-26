'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Flame, Snowflake, Rocket, AlertTriangle, Bell } from 'lucide-react'
import HelpTooltip from '@/components/ui/HelpTooltip'
import AppShell from '@/components/layout/AppShell'
import QuickInput from '@/components/dashboard/QuickInput'
import StatCard from '@/components/dashboard/StatCard'
import ProjectCard from '@/components/dashboard/ProjectCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import FleetProactivity from '@/components/fleet/FleetProactivity'
import FleetAnalytics from '@/components/fleet/FleetAnalytics'
import EnergyHeatmap from '@/components/dashboard/EnergyHeatmap'
import { type Project } from '@/lib/types'
import { getProjects, createProject } from '@/lib/queries'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Erreur chargement projets:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const stats = {
    total: projects.length,
    vibecoding: projects.filter(p => p.status === 'vibecoding').length,
    hibernation: projects.filter(p => p.status === 'hibernation').length,
    zombies: projects.filter(p => p.is_zombie).length,
  }

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.status === filter)

  const handleQuickInput = async (value: string) => {
    try {
      await createProject(value)
      await loadProjects()
    } catch (err) {
      console.error('Erreur création projet:', err)
    }
  }

  const filters = [
    { key: 'all', label: ' Tous', count: stats.total },
    { key: 'vibecoding', label: ' Actifs', count: stats.vibecoding },
    { key: 'stable', label: ' Dépôts Stables', count: projects.filter(p => p.status === 'stable').length },
    { key: 'hibernation', label: ' Archivés', count: stats.hibernation },
    { key: 'idéation', label: ' Idées', count: projects.filter(p => p.status === 'idéation').length },
    { key: 'cimetière', label: ' Obsolètes', count: projects.filter(p => p.status === 'cimetière').length },
  ]

  return (
    <AppShell>
      <div className="py-6 sm:py-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 lg:mb-20">
          <h1 className="text-4xl md:text-6xl 2xl:text-7xl font-bold mb-4"><span className="gradient-text">Nexus Engineering</span></h1>
          <p className="text-base md:text-xl mb-12 tracking-wide max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Centre de Commande Technique. Supervision des déploiements et architecture logicielle.
          </p>
          <div className="flex items-center justify-center gap-2">
            <QuickInput onSubmit={handleQuickInput} />
            <HelpTooltip
              title="Création Rapide"
              description="Créez un nouveau projet en tapant simplement son nom. Il sera automatiquement ajouté à votre tableau de bord."
              steps={['Tapez le nom de votre projet', 'Appuyez sur Entrée pour créer', 'Le projet apparaîtra dans la grille ci-dessous']}
            />
          </div>
        </motion.div>

        {/* Stats */}
        {/* Stats & Global Metrics */}
        <div className="mb-12 space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]"
          >
            <StatCard label="Projets Totaux" value={stats.total} icon={<Rocket className="w-5 h-5" />} color="#3B82F6" />
            <StatCard label="Déploiements Actifs" value={stats.vibecoding} icon={<Flame className="w-5 h-5" />} color="#22C55E" subtitle="En ligne" />
            <StatCard label="Services Archivés" value={stats.hibernation} icon={<Snowflake className="w-5 h-5" />} color="#F59E0B" />
            <StatCard label="Instances Obsolètes" value={stats.zombies} icon={<AlertTriangle className="w-5 h-5" />} color="#EF4444" subtitle="Inactifs 6+ mois" />
          </motion.div>

          <FleetAnalytics projects={projects} />
        </div>

        {/* Main Content: 12 Columns Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">

          {/* Left: Projects Grid (8/12) */}
          <div className="xl:col-span-8 space-y-8">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <HelpTooltip
                title="Filtres de Projets"
                description="Filtrez vos projets par statut pour retrouver rapidement ceux qui vous intéressent."
                steps={['Cliquez sur un filtre pour afficher les projets correspondants', 'Le compteur indique le nombre de projets dans chaque catégorie']}
              />
              {filters.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 uppercase tracking-widest"
                  style={{
                    background: filter === f.key ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)',
                    color: filter === f.key ? 'var(--accent-green)' : 'var(--text-secondary)',
                    border: `1px solid ${filter === f.key ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-subtle)'}`,
                  }}>
                  {f.label}
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg-elevated)', color: filter === f.key ? 'var(--accent-green)' : 'var(--text-muted)' }}>{f.count}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-4xl inline-block">⚡</motion.div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]"
              >
                {filteredProjects.map((project) => (
                  <motion.div key={project.id} variants={item}>
                    <ProjectCard
                      id={project.id} title={project.title} description={project.description}
                      status={project.status} techDebtScore={project.tech_debt_score}
                      repoUrl={project.repo_url} deployUrl={project.deploy_url} updatedAt={project.updated_at}
                      onClick={() => router.push(`/projects/${project.id}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loading && filteredProjects.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 p-8 rounded-2xl border bg-white" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="text-5xl mb-4">🫥</div>
                <p className="text-sm font-bold text-zinc-400">
                  {projects.length === 0 ? 'Aucun projet encore. Tape le nom de ton premier projet ci-dessus !' : 'Aucun projet dans cette catégorie.'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right: Intelligence & Activity (4/12) */}
          <div className="xl:col-span-4 space-y-8">
            <div className="p-6 rounded-2xl border shadow-premium" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Proactivité</span>
                <HelpTooltip
                  title="Proactivité de la Flotte"
                  description="Suggestions automatiques basées sur l'état de vos projets. Le système détecte les problèmes potentiels et propose des actions correctives."
                  steps={['Les alertes apparaissent automatiquement', 'Cliquez sur une suggestion pour appliquer l\'action recommandée']}
                />
              </div>
              <FleetProactivity />
            </div>

            <div className="p-6 rounded-2xl border shadow-premium" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Heatmap</span>
                <HelpTooltip
                  title="Carte de Chaleur d'Activité"
                  description="Visualisez votre activité de développement sur les 12 dernières semaines. Chaque case représente un jour — plus la couleur est intense, plus vous avez été actif."
                />
              </div>
              <EnergyHeatmap />
            </div>

            <div className="p-6 rounded-2xl border shadow-premium" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-xs font-black tracking-widest uppercase mb-6 flex items-center gap-2 text-zinc-500">
                <Bell className="w-4 h-4 text-indigo-500" /> Flux d'Activité
                <HelpTooltip
                  title="Flux d'Activité"
                  description="Historique chronologique de toutes les actions effectuées sur vos projets : créations, mises à jour, déploiements, et événements GitHub."
                />
              </h3>
              <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <ActivityFeed />
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell >
  )
}

