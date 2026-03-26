import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const response = NextResponse.redirect(`${origin}/`)

            if (data.session?.provider_token) {
                response.cookies.set('github_provider_token', data.session.provider_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days expiration
                })
            }

            return response
        }
    }

    // Return the user to an error page or login with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
