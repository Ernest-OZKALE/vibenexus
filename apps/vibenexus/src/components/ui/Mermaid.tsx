'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidProps {
    chart: string
    id: string
}

export default function Mermaid({ chart, id }: MermaidProps) {
    const [svg, setSvg] = useState<string>('')
    const [error, setError] = useState<boolean>(false)

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'neutral',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
            themeVariables: {
                primaryColor: '#ECFDF5',
                primaryTextColor: '#065F46',
                primaryBorderColor: '#6EE7B7',
                lineColor: '#94A3B8',
                secondaryColor: '#F0F9FF',
                tertiaryColor: '#F5F3FF',
                background: '#FFFFFF',
                mainBkg: '#ECFDF5',
                nodeBorder: '#10B981',
                clusterBkg: '#F8FAFC',
                clusterBorder: '#E2E8F0',
                titleColor: '#0F172A',
                edgeLabelBackground: '#FFFFFF',
            },
        })

        const renderChart = async () => {
            try {
                // Ensure the chart doesn't have markdown code blocks
                const cleanChart = chart.replace(/```mermaid/g, '').replace(/```/g, '').trim()
                const { svg } = await mermaid.render(id, cleanChart)
                setSvg(svg)
                setError(false)
            } catch (err) {
                console.error('Mermaid render error:', err)
                setError(true)
            }
        }

        if (chart) {
            renderChart()
        }
    }, [chart, id])

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px]">
                Erreur de rendu du diagramme. Le code Mermaid semble invalide.
            </div>
        )
    }

    return (
        <div
            className="flex justify-center p-6 bg-white rounded-xl border border-gray-100 overflow-x-auto"
            style={{ minHeight: '100px' }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}
