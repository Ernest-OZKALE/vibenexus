import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as os from 'os'

const execAsync = promisify(exec)

export async function POST(req: Request) {
    const host = req.headers.get('host') || ''
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')

    if (process.env.NODE_ENV === 'production' && !isLocal) {
        return NextResponse.json(
            { error: 'Les actions locales ne fonctionnent qu\'en mode développement (localhost).' },
            { status: 403 }
        )
    }

    try {
        const body = await req.json()
        const { action, targetPath, githubRepo } = body

        if (!targetPath) {
            return NextResponse.json({ error: 'Un chemin local absolu est requis.' }, { status: 400 })
        }

        let command = ''
        const isWindows = os.platform() === 'win32'

        switch (action) {
            case 'vscode':
                command = `code "${targetPath}"`
                break
            case 'folder':
                command = isWindows ? `explorer "${targetPath}"` : `open "${targetPath}"`
                break
            case 'github':
                // Try to use github desktop CLI, or fallback
                command = `github "${targetPath}"`
                break
            default:
                return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 })
        }

        await execAsync(command)

        return NextResponse.json({ success: true, message: `Commande executée !` })
    } catch (error: any) {
        console.error('Erreur Action Locale:', error)
        return NextResponse.json(
            { error: `Échec de l'action: ${error.message || 'Erreur inconnue'}` },
            { status: 500 }
        )
    }
}
