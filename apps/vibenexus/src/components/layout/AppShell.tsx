'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import NotificationCenter from '@/components/layout/NotificationCenter'
import CommandPalette from '@/components/ui/CommandPalette'
import { Menu } from 'lucide-react'

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
            {/* Sidebar: Flex-integrated on desktop, fixed drawer on mobile */}
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
                <header
                    className="h-16 flex items-center justify-between lg:justify-end px-4 sm:px-8 border-b border-gray-200 z-30 sticky top-0 bg-white/80 backdrop-blur-xl"
                >
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 rounded-lg lg:hidden hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-700"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                    </div>
                </header>

                <main className="flex-1 w-full grid-bg min-h-full">
                    <div className="py-8 lg:py-16 w-full">
                        <div className="w-full px-6 sm:px-12 xl:px-24">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
            <CommandPalette />
        </div>
    )
}
