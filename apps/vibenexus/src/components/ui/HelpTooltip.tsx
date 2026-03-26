'use client'

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HelpTooltipProps {
    title: string
    description: string
    steps?: string[]
}

export default function HelpTooltip({ title, description, steps }: HelpTooltipProps) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    return (
        <div className="relative inline-flex items-center" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-5 h-5 rounded-full border border-gray-300 bg-white text-gray-400 hover:text-emerald-500 hover:border-emerald-300 flex items-center justify-center transition-all shadow-sm"
                aria-label={`Aide : ${title}`}
            >
                <HelpCircle className="w-3 h-3" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[200] top-full mt-2 right-0 w-72 p-4 bg-white rounded-xl border border-gray-200 shadow-xl"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-3">{description}</p>
                        {steps && steps.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Comment faire</span>
                                <ol className="space-y-1">
                                    {steps.map((step, i) => (
                                        <li key={i} className="flex gap-2 text-xs text-gray-600">
                                            <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
