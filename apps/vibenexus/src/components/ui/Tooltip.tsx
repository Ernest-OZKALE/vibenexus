import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
    text: string
    children: React.ReactNode
    position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ text, children, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)

    const positions = {
        top: '-top-10 left-1/2 -translate-x-1/2',
        bottom: '-bottom-10 left-1/2 -translate-x-1/2',
        left: 'top-1/2 -left-32 -translate-y-1/2',
        right: 'top-1/2 -right-32 -translate-y-1/2'
    }

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
                        className={`absolute z-[100] px-2 py-1 bg-white text-zinc-900 text-[10px] font-bold rounded shadow-xl border border-zinc-200 whitespace-nowrap pointer-events-none ${positions[position]}`}
                    >
                        {text}
                        <div className={`absolute w-1.5 h-1.5 bg-white border-zinc-200 rotate-45 ${position === 'top' ? 'bottom-[-0.75px] left-1/2 -translate-x-1/2 border-r border-b' :
                            position === 'bottom' ? 'top-[-0.75px] left-1/2 -translate-x-1/2 border-l border-t' :
                                position === 'left' ? 'right-[-0.75px] top-1/2 -translate-y-1/2 border-r border-t' :
                                    'left-[-0.75px] top-1/2 -translate-y-1/2 border-l border-b'
                            }`} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
