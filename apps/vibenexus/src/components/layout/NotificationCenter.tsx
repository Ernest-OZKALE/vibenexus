'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Info, AlertTriangle, CheckCircle2, FileText, Check, MoreHorizontal, Hammer } from 'lucide-react'
import { getEvents, markEventAsRead, markAllEventsAsRead } from '@/lib/queries'
import { type NexusEvent } from '@/lib/types'

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false)
    const [events, setEvents] = useState<NexusEvent[]>([])
    const [loading, setLoading] = useState(false)

    const fetchEvents = async () => {
        setLoading(true)
        try {
            const data = await getEvents()
            setEvents(data)
        } catch (err) {
            console.error('Error loading notifications:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
        const interval = setInterval(fetchEvents, 60000) // Poll every 1m
        return () => clearInterval(interval)
    }, [])

    const unreadCount = events.filter(e => !e.is_read).length

    const handleMarkAsRead = async (id: string) => {
        try {
            await markEventAsRead(id)
            setEvents(events.map(e => e.id === id ? { ...e, is_read: true } : e))
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllEventsAsRead()
            setEvents(events.map(e => ({ ...e, is_read: true })))
        } catch (err) {
            console.error('Error marking all as read:', err)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'healthcheck_fail': return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            case 'adr_generated': return <FileText className="w-3.5 h-3.5 text-purple-500" />
            case 'autofix_pr': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            case 'intelligence_audit': return <Info className="w-3.5 h-3.5 text-blue-500" />
            case 'project_foundry': return <Hammer className="w-3.5 h-3.5 text-blue-400" />
            default: return <Info className="w-3.5 h-3.5 text-zinc-500" />
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-all outline-none relative group"
                style={{ color: 'var(--text-secondary)' }}
            >
                <Bell className="w-5 h-5 group-hover:text-emerald-400 transition-colors" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white"
                        />
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 md:w-96 max-h-[500px] overflow-hidden rounded-3xl border shadow-2xl z-50 flex flex-col"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Flux d'Intelligence</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 transition-colors"
                                >
                                    Tout marquer lu
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {events.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-xs text-zinc-600 italic">Aucune notification pour le moment.</p>
                                    </div>
                                ) : (
                                    events.map((event) => (
                                        <div
                                            key={event.id}
                                            onClick={() => !event.is_read && handleMarkAsRead(event.id)}
                                            className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${event.is_read ? 'opacity-60 bg-transparent' : 'bg-emerald-50 border-gray-200'
                                                }`}
                                        >
                                            {!event.is_read && (
                                                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            )}
                                            <div className="flex gap-3">
                                                <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 h-fit">
                                                    {getIcon(event.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                                                        {event.title}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-500 line-clamp-2 mb-2">
                                                        {event.description}
                                                    </p>
                                                    <p className="text-[9px] text-zinc-600 font-medium">
                                                        {new Date(event.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t text-center" style={{ borderColor: 'var(--border-subtle)' }}>
                                <button className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 flex items-center gap-1 mx-auto transition-colors">
                                    Voir tout l'historique <Check className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
