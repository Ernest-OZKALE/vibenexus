'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Zap,
    LayoutDashboard,
    FolderKanban,
    Lightbulb,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Github,
    LayoutGrid,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
    { href: '/', label: 'Tableau de Bord', icon: LayoutDashboard },
    { href: '/projects', label: 'Projets', icon: FolderKanban },
    { href: '/fleet', label: 'Flotte Autonome', icon: LayoutGrid },
    { href: '/github', label: 'Dépôts GitHub', icon: Github },
    { href: '/ideas', label: 'Labo Innovation', icon: Lightbulb },
    { href: '/settings', label: 'Paramètres', icon: Settings },
]

interface SidebarProps {
    collapsed: boolean
    setCollapsed: (v: boolean) => void
    isOpen?: boolean
    onClose?: () => void
}

export default function Sidebar({ collapsed, setCollapsed, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<{ name: string; avatar: string; email: string } | null>(null)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user: authUser } }) => {
            if (authUser) {
                setUser({
                    name: authUser.user_metadata?.user_name || authUser.user_metadata?.full_name || 'User',
                    avatar: authUser.user_metadata?.avatar_url || '',
                    email: authUser.email || '',
                })
            }
        })
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: collapsed ? '5rem' : '16rem',
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={`flex-shrink-0 lg:sticky fixed left-0 top-0 h-screen z-[101] flex flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo Area */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-emerald-600 text-white shadow-md">
                            <Zap className="w-5 h-5 fill-current" />
                        </div>
                        {!collapsed && (
                            <span className="text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap">
                                Nexus<span className="text-emerald-600">Engineering</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-none">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => { if (isOpen) onClose?.() }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-700'}`} />
                                {!collapsed && (
                                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                )}
                                {isActive && !collapsed && (
                                    <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-4 border-t border-gray-200 shrink-0">
                    {user && (
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 shrink-0 mb-3 overflow-hidden border border-gray-200">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                        >
                            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </button>
                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                            >
                                <LogOut className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                                <span className="text-sm font-bold">Déconnexion</span>
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>
        </>
    )
}
