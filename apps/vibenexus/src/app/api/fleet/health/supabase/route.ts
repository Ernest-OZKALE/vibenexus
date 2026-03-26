import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { url, key } = await request.json()

        if (!url || !key) {
            return NextResponse.json({ status: 'missing_config' })
        }

        // Lightweight check: try to fetch the Supabase project configuration or just a simple ping
        // We can try to list schemas or just hit the REST endpoint
        const start = Date.now()
        const res = await fetch(`${url}/rest/v1/?apikey=${key}`, {
            method: 'GET',
            headers: {
                'apikey': key,
            },
            signal: AbortSignal.timeout(5000)
        })
        const latency = Date.now() - start

        if (res.ok) {
            // Try to get table count if possible (PostgREST specific)
            // This is a bit hacky as we don't know the tables, but we can try to guess or use a generic query
            // For now, let's stick to latency and basic 'online' status, but we can try to find 'users' or 'profiles'

            return NextResponse.json({
                status: 'online',
                latency,
                details: {
                    server: res.headers.get('server'),
                    version: res.headers.get('x-powered-by')
                }
            })
        } else {
            return NextResponse.json({
                status: 'error',
                code: res.status,
                message: res.statusText
            })
        }
    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            error: err.message
        }, { status: 500 })
    }
}
