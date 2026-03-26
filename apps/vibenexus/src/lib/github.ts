// GitHub API utility - uses the provider_token from Supabase Auth session

const GITHUB_API = 'https://api.github.com'

export interface GitHubRepo {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    default_branch: string
    language: string | null
    stargazers_count: number
    updated_at: string
    pushed_at: string
    private: boolean
    topics: string[]
}

export interface GitHubCommit {
    sha: string
    commit: {
        message: string
        author: {
            name: string
            date: string
        }
    }
    author: {
        login: string
        avatar_url: string
    } | null
    html_url: string
}

export interface GitHubReadme {
    content: string
    encoding: string
}

export interface GitHubTreeItem {
    path: string
    mode: string
    type: 'blob' | 'tree'
    sha: string
    size?: number
    url: string
}

export interface GitHubTree {
    sha: string
    url: string
    tree: GitHubTreeItem[]
    truncated: boolean
}

export interface GitHubBlob {
    content: string
    encoding: string
    sha: string
    size: number;
}

export interface GitHubWorkflowRun {
    id: number;
    name: string;
    head_branch: string;
    status: string;
    conclusion: string | null;
    html_url: string;
    created_at: string;
    updated_at: string;
    trigger_id?: number;
}

async function githubFetch(endpoint: string, token: string, options?: RequestInit) {
    const res = await fetch(`${GITHUB_API}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
    })
    if (!res.ok) {
        const err = await res.text()
        throw new Error(`GitHub API error (${res.status}): ${err}`)
    }
    return res.json()
}

export async function getUserRepos(token: string, page = 1, perPage = 30): Promise<GitHubRepo[]> {
    return githubFetch(`/user/repos?sort=updated&direction=desc&per_page=${perPage}&page=${page}&type=all`, token)
}

export async function getRepoCommits(token: string, fullName: string, perPage = 20): Promise<GitHubCommit[]> {
    return githubFetch(`/repos/${fullName}/commits?per_page=${perPage}`, token)
}

export async function getRecentCommitsCount(token: string, fullName: string, days: number = 30): Promise<number> {
    const date = new Date()
    date.setDate(date.getDate() - days)
    const since = date.toISOString()
    try {
        const commits = await githubFetch(`/repos/${fullName}/commits?since=${since}&per_page=100`, token)
        return Array.isArray(commits) ? commits.length : 0
    } catch {
        return 0
    }
}

export async function getRepoReadme(token: string, fullName: string): Promise<string | null> {
    try {
        const data: GitHubReadme = await githubFetch(`/repos/${fullName}/readme`, token)
        return Buffer.from(data.content, 'base64').toString('utf-8')
    } catch {
        return null
    }
}

export async function getRepoLanguages(token: string, fullName: string): Promise<Record<string, number>> {
    return githubFetch(`/repos/${fullName}/languages`, token)
}

export async function getRepoTree(token: string, fullName: string, defaultBranch: string): Promise<GitHubTree> {
    // Recursive fetch of the tree
    return githubFetch(`/repos/${fullName}/git/trees/${defaultBranch}?recursive=1`, token)
}

export async function getRepoFileContent(token: string, fullName: string, path: string): Promise<string | null> {
    try {
        const data: GitHubReadme = await githubFetch(`/repos/${fullName}/contents/${path}`, token)
        if (data && data.content) {
            return Buffer.from(data.content, 'base64').toString('utf-8')
        }
        return null
    } catch {
        return null
    }
}

export async function createAutoFixPR(
    token: string,
    fullName: string,
    baseBranch: string,
    files: { filePath: string; newContent: string }[],
    prTitle: string,
    prBody: string
): Promise<string> {
    const branchName = `nexus-autofix-${Date.now()}`

    // 1. Get base branch SHA
    const refData = await githubFetch(`/repos/${fullName}/git/ref/heads/${baseBranch}`, token)
    const baseSha = refData.object.sha

    // 2. Create new branch
    await githubFetch(`/repos/${fullName}/git/refs`, token, {
        method: 'POST',
        body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: baseSha
        })
    })

    // 3. Create/Update files
    for (const file of files) {
        let fileSha: string | undefined
        try {
            const fileData = await githubFetch(`/repos/${fullName}/contents/${file.filePath}?ref=${branchName}`, token)
            fileSha = fileData.sha
        } catch {
            // File doesn't exist, which is fine
        }

        const contentBase64 = Buffer.from(file.newContent).toString('base64')
        await githubFetch(`/repos/${fullName}/contents/${file.filePath}`, token, {
            method: 'PUT',
            body: JSON.stringify({
                message: prTitle,
                content: contentBase64,
                branch: branchName,
                ...(fileSha ? { sha: fileSha } : {})
            })
        })
    }

    // 5. Create Pull Request
    const prData = await githubFetch(`/repos/${fullName}/pulls`, token, {
        method: 'POST',
        body: JSON.stringify({
            title: prTitle,
            body: prBody,
            head: branchName,
            base: baseBranch
        })
    })

    return prData.html_url
}

export async function commitFileToRepo(
    token: string,
    fullName: string,
    branch: string,
    filePath: string,
    content: string,
    commitMessage: string
): Promise<void> {
    // 1. Get existing file SHA
    let fileSha: string | undefined
    try {
        const fileData = await githubFetch(`/repos/${fullName}/contents/${filePath}?ref=${branch}`, token)
        fileSha = fileData.sha
    } catch {
        // File doesn't exist
    }

    // 2. Create/Update file
    const contentBase64 = Buffer.from(content).toString('base64')
    await githubFetch(`/repos/${fullName}/contents/${filePath}`, token, {
        method: 'PUT',
        body: JSON.stringify({
            message: commitMessage,
            content: contentBase64,
            branch: branch,
            ...(fileSha ? { sha: fileSha } : {})
        })
    })
}

export async function getRepoWorkflowRuns(token: string, fullName: string, perPage = 10): Promise<GitHubWorkflowRun[]> {
    const data = await githubFetch(`/repos/${fullName}/actions/runs?per_page=${perPage}`, token)
    return data.workflow_runs || []
}

export async function triggerWorkflowDispatch(token: string, fullName: string, workflowId: string | number, ref: string): Promise<void> {
    await githubFetch(`/repos/${fullName}/actions/workflows/${workflowId}/dispatches`, token, {
        method: 'POST',
        body: JSON.stringify({ ref })
    })
}

export function generateReadmeTemplate(project: {
    title: string
    description?: string | null
    status?: string
    techStack?: string[]
    repoUrl?: string | null
    deployUrl?: string | null
}): string {
    const statusLabel: Record<string, string> = {
        'idéation': 'Backlog / Ideation',
        'vibecoding': 'Active Development',
        'stable': 'Stable / Production',
        'hibernation': 'Archived',
        'cimetière': 'Deprecated',
    }

    const lines: string[] = []
    lines.push(`# ${project.title}`)
    lines.push('')

    // Professional Badges
    const statusColor = project.status === 'stable' ? 'success' : project.status === 'vibecoding' ? 'orange' : 'inactive'
    lines.push(`![Status](https://img.shields.io/badge/Status-${encodeURIComponent(statusLabel[project.status || ''] || 'Unknown')}-${statusColor}?style=for-the-badge)`)
    lines.push(`![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)`)
    if (project.techStack?.length) {
        lines.push(`![Stack](https://img.shields.io/badge/Stack-${encodeURIComponent(project.techStack[0])}-7957ff?style=for-the-badge)`)
    }
    lines.push('')

    if (project.description) {
        lines.push(`> ${project.description}`)
        lines.push('')
    }

    lines.push('## 🗺️ Architecture Overview')
    lines.push('')
    lines.push('```mermaid')
    lines.push('graph TD')
    lines.push('    A[Client] --> B[API]')
    lines.push('    B --> C[Database]')
    lines.push('```')
    lines.push('')

    if (project.techStack && project.techStack.length > 0) {
        lines.push('## 🛠️ Technical Stack')
        lines.push('')
        project.techStack.forEach(t => lines.push(`- **${t}**`))
        lines.push('')
    }

    lines.push('## ⚙️ Installation')
    lines.push('')
    lines.push('```bash')
    lines.push('# Clone repository')
    lines.push(`git clone ${project.repoUrl || '<repository-url>'}`)
    lines.push('')
    lines.push('# Install dependencies')
    lines.push('npm install')
    lines.push('')
    lines.push('# Start development server')
    lines.push('npm run dev')
    lines.push('```')
    lines.push('')

    if (project.deployUrl) {
        lines.push(`## 🚀 Deployment`)
        lines.push('')
        lines.push(`Access the live application at: [${project.deployUrl}](${project.deployUrl})`)
        lines.push('')
    }

    lines.push('## 🤝 Contribution')
    lines.push('')
    lines.push('1. Fork the project')
    lines.push('2. Create your Feature Branch')
    lines.push('3. Commit your Changes')
    lines.push('4. Push to the Branch')
    lines.push('5. Open a Pull Request')
    lines.push('')

    lines.push('## 📝 License')
    lines.push('Distributed under the MIT License.')
    lines.push('')
    lines.push('---')
    lines.push(`*Generated with passion by [VibeNexus Engineering Command Center](https://vibenexus.vercel.app)*`)

    return lines.join('\n')
}
