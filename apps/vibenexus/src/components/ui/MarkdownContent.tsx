import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif'
})

interface MarkdownContentProps {
    content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (containerRef.current) {
            mermaid.contentLoaded()
        }
    }, [content])

    return (
        <div ref={containerRef} className="prose prose-invert prose-sm max-w-none 
            prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-zinc-800
            prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-400
            prose-code:text-emerald-400 prose-code:bg-zinc-800/50 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        if (!inline && match && match[1] === 'mermaid') {
                            return (
                                <div className="mermaid bg-white/5 p-4 rounded-xl my-4 flex justify-center overflow-x-auto">
                                    {String(children).replace(/\n$/, '')}
                                </div>
                            )
                        }
                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
