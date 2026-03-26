import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    let targetUrl = searchParams.get('url')

    if (!targetUrl) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    // Ensure URL has protocol
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl
    }

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const start = Date.now()
        const response = await fetch(targetUrl, { signal: controller.signal, method: 'HEAD' })
        clearTimeout(timeoutId)

        const ping = Date.now() - start

        return NextResponse.json({
            ok: response.ok,
            status: response.status,
            ping
        })
    } catch (error) {
        return NextResponse.json({ ok: false, status: 0, error: 'Unreachable' })
    }
}
