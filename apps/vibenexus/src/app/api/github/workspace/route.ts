import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getRepoTree, getRepoFileContent, getRepoReadme, getRepoLanguages } from '@/lib/github'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const repoFullName = searchParams.get('repo')
    const defaultBranch = searchParams.get('branch')

    if (!repoFullName || !defaultBranch) {
        return NextResponse.json({ error: 'Missing repo or branch parameter' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const cookieStore = await cookies()
    const providerToken = cookieStore.get('github_provider_token')?.value

    if (!providerToken) {
        return NextResponse.json({ error: 'Not authenticated with GitHub or missing permissions' }, { status: 401 })
    }

    const token = providerToken

    try {
        // 1. Fetch Repository Tree
        const treeData = await getRepoTree(token, repoFullName, defaultBranch)

        // Filter out noise (node_modules, .git, dist, etc.) to keep context clean for AI
        const ignorePatterns = ['.git', 'node_modules', 'dist', 'build', '.next', 'out', 'coverage', 'public']
        const cleanTree = treeData.tree
            .filter(item => !ignorePatterns.some(pattern => item.path.includes(pattern)))
            .map(item => ({
                path: item.path,
                type: item.type,
                size: item.size
            }))

        // 2. Fetch critical files content
        const [readme, packageJson, languages] = await Promise.all([
            getRepoReadme(token, repoFullName),
            getRepoFileContent(token, repoFullName, 'package.json'),
            getRepoLanguages(token, repoFullName)
        ])

        return NextResponse.json({
            repo: repoFullName,
            branch: defaultBranch,
            context: {
                tree: cleanTree,
                readme: readme,
                packageJson: packageJson,
                languages: languages
            }
        })

    } catch (error) {
        console.error('Workspace fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch repository workspace context' }, { status: 500 })
    }
}
