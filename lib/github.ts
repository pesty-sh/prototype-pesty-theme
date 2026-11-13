import { projects as configured, siteConfig, type InstallChannel } from '@/projects.config'

type GhRepo = {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
  homepage: string | null
  pushed_at: string
  topics?: string[]
  license: { spdx_id: string } | null
  fork: boolean
  archived: boolean
  private: boolean
}

export type ReleaseAsset = {
  name: string
  size: number
  browser_download_url: string
  download_count: number
}

export type Release = {
  tag_name: string
  name: string | null
  published_at: string
  html_url: string
  body: string | null
  prerelease: boolean
  assets: ReleaseAsset[]
}

export type Project = {
  slug: string
  name: string
  tagline: string
  description: string | null
  language: string | null
  stars: number
  url: string
  homepage: string | null
  license: string | null
  pushedAt: string | null
  topics: string[]
  channels: InstallChannel[]
  note?: string
  mark?: string
  markAlt?: string
  release: Release | null
}

const API = 'https://api.github.com'

async function gh<T>(path: string, accept = 'application/vnd.github+json'): Promise<T | null> {
  const headers: Record<string, string> = { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  try {
    const res = await fetch(`${API}${path}`, { headers, next: { revalidate: siteConfig.revalidateSeconds } })
    if (!res.ok) return null
    return (accept.includes('html') ? await res.text() : await res.json()) as T
  } catch {
    return null
  }
}

async function listRepos(): Promise<GhRepo[]> {
  const repos = await gh<GhRepo[]>(`/users/${siteConfig.owner}/repos?per_page=100&sort=pushed`)
  return Array.isArray(repos) ? repos : []
}

export async function getLatestRelease(repo: string) {
  return gh<Release>(`/repos/${siteConfig.owner}/${repo}/releases/latest`)
}

export async function getReadmeHtml(repo: string) {
  return gh<string>(`/repos/${siteConfig.owner}/${repo}/readme`, 'application/vnd.github.html')
}

function toProject(slug: string, repo: GhRepo | undefined, release: Release | null): Project {
  const cfg = configured.find((p) => p.repo === slug)
  const homepage = repo?.homepage && !repo.homepage.replace(/\/$/, '').endsWith('pesty.sh') ? repo.homepage : null
  return {
    slug,
    name: slug,
    tagline: cfg?.tagline ?? repo?.description ?? 'No description yet.',
    description: repo?.description ?? cfg?.tagline ?? null,
    language: repo?.language ?? null,
    stars: repo?.stargazers_count ?? 0,
    url: repo?.html_url ?? `https://github.com/${siteConfig.owner}/${slug}`,
    homepage,
    license: repo?.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : null,
    pushedAt: repo?.pushed_at ?? null,
    topics: repo?.topics ?? [],
    channels: cfg?.channels ?? [],
    note: cfg?.note,
    mark: cfg?.mark,
    markAlt: cfg?.markAlt,
    release,
  }
}

async function resolveSlugs() {
  const repos = await listRepos()
  const byName = new Map(repos.map((r) => [r.name, r]))
  const slugs = configured.map((p) => p.repo)
  if (siteConfig.autoDiscover) {
    for (const r of repos) {
      if (r.fork || r.archived || r.private || siteConfig.exclude.includes(r.name) || slugs.includes(r.name)) continue
      slugs.push(r.name)
    }
  }
  return { slugs, byName }
}

export async function getProjects(): Promise<Project[]> {
  const { slugs, byName } = await resolveSlugs()
  const releases = await Promise.all(slugs.map((s) => getLatestRelease(s)))
  return slugs.map((s, i) => toProject(s, byName.get(s), releases[i]))
}

export async function getProjectSlugs() {
  return (await resolveSlugs()).slugs
}

export async function getProject(slug: string): Promise<Project | null> {
  const { slugs, byName } = await resolveSlugs()
  if (!slugs.includes(slug)) return null
  return toProject(slug, byName.get(slug), await getLatestRelease(slug))
}
