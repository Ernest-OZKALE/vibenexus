'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Zap } from 'lucide-react'

interface QuickInputProps {
    onSubmit: (value: string) => void
    placeholder?: string
}

export default function QuickInput({ onSubmit, placeholder = 'Sur quoi on vibecode aujourd\'hui ?' }: QuickInputProps) {
    const [value, setValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (value.trim()) {
            onSubmit(value.trim())
            setValue('')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
            <motion.div
                animate={{
                    boxShadow: isFocused
                        ? '0 0 0 2px rgba(22, 163, 74, 0.2), 0 4px 20px rgba(22, 163, 74, 0.06)'
                        : '0 0 0 1px var(--border-subtle), 0 1px 3px rgba(0,0,0,0.04)',
                }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)' }}
            >
                <div className="flex items-center px-5 py-4">
                    <AnimatePresence mode="wait">
                        {isFocused ? (
                            <motion.div
                                key="zap"
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                            >
                                <Zap className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: 'var(--accent-green)' }} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="search"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <Search className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none text-base placeholder-zinc-500"
                        style={{ color: 'var(--text-primary)' }}
                    />

                    {value && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            type="submit"
                            className="ml-3 p-2 rounded-lg flex items-center gap-1.5 text-sm font-medium text-white"
                            style={{ background: 'var(--gradient-vibe)' }}
                        >
                            <Plus className="w-4 h-4" />
                            Go
                        </motion.button>
                    )}

                    {!value && (
                        <div
                            className="ml-3 text-xs px-2 py-1 rounded-md"
                            style={{
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Ctrl+K
                        </div>
                    )}
                </div>
            </motion.div>
        </form>
    )
}
