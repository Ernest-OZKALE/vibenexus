import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { commitFileToRepo } from '@/lib/github'

export async function POST(request: NextRequest) {
    try {
        const { repoFullName, branch, filePath, content, commitMessage } = await request.json()

        if (!repoFullName || !branch || !filePath || !content) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
        }

        const cookieStore = await cookies()
        const token = cookieStore.get('github_provider_token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Token GitHub manquant. Reconnectez-vous.' }, { status: 401 })
        }

        await commitFileToRepo(token, repoFullName, branch, filePath, content, commitMessage || `chore(nexus): update ${filePath}`)

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Error committing to GitHub:', err)
        return NextResponse.json({ error: err.message || 'Échec du commit' }, { status: 500 })
    }
}
