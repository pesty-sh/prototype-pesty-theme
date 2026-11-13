import { getProjects, type Project } from '@/lib/github'
import { siteConfig } from '@/projects.config'
import { seo, type ProjectSeo } from '@/seo.config'

function pageUrl(path: string) {
  return new URL(path, seo.siteUrl).toString()
}

function extra(project: Project): ProjectSeo {
  return seo.projects[project.slug as keyof typeof seo.projects] ?? {}
}

function link(project: Project) {
  const copy = extra(project)
  const label = copy.title ?? project.name
  const description = copy.description ?? project.tagline
  return `- [${label}](${pageUrl(`/projects/${project.slug}`)}): ${description}`
}

function installFor(name: string) {
  const lines = [
    `Homebrew, macOS and Linux. Add the tap once, then install:`,
    '',
    '```',
    `brew tap ${siteConfig.brewTap}`,
    `brew trust --tap ${siteConfig.brewTap}`,
    `brew install ${siteConfig.brewTap}/${name}`,
    '```',
    '',
    `apt, Ubuntu 18.04+ and Debian 10+. Add the signed repo once, then install:`,
    '',
    '```',
    `curl -fsSL ${siteConfig.aptRepo}/pesty-archive-keyring.gpg | sudo tee /usr/share/keyrings/pesty-archive-keyring.gpg >/dev/null`,
    `echo "deb [signed-by=/usr/share/keyrings/pesty-archive-keyring.gpg] ${siteConfig.aptRepo} stable main" | sudo tee /etc/apt/sources.list.d/pesty.list`,
    'sudo apt-get update',
    `sudo apt-get install ${name}`,
    '```',
  ]
  return lines.join('\n')
}

/** Short index. Linked sections, plus the service description. */
export async function llmsIndex() {
  const projects = await getProjects()
  const tools = projects.filter((project) => project.channels.length > 0)
  const prototypes = projects.filter((project) => project.channels.length === 0)
  return [
    `# ${seo.siteName}`,
    '',
    `> ${seo.ai.summary}`,
    '',
    seo.ai.about,
    '',
    '## Tools',
    '',
    ...tools.map(link),
    '',
    '## Service',
    '',
    seo.ai.service,
    '',
    `- [pesty.sh](${seo.siteUrl}): ${seo.home.description}`,
    '',
    '## Install',
    '',
    `- [Install on pesty.sh](${pageUrl('/#install')}): Homebrew and apt. The tap and the apt repo are added once per machine.`,
    '',
    '## Optional',
    '',
    ...prototypes.map(link),
    `- [Full text](${pageUrl('/llms-full.txt')}): the same pages written out for an indexer.`,
    `- [Source](${seo.organization.sameAs[0]}): the GitHub organization.`,
    '',
  ].join('\n')
}

/** Longer text an indexer can quote without opening each page. */
export async function llmsFullIndex() {
  const projects = await getProjects()
  const sections = projects.map((project) => {
    const copy = extra(project)
    const title = copy.title ?? project.name
    const description = copy.description ?? project.tagline
    const parts = [
      `## ${title}`,
      '',
      description,
      '',
      `- Page: ${pageUrl(`/projects/${project.slug}`)}`,
      `- Source: ${project.url}`,
      project.language ? `- Language: ${project.language}` : '',
      project.license ? `- License: ${project.license}` : '',
      project.note ? `- Note: ${project.note}` : '',
    ].filter(Boolean)
    if (project.channels.length > 0) {
      parts.push('', installFor(project.slug))
    }
    return parts.join('\n')
  })

  return [
    `# ${seo.siteName}`,
    '',
    `> ${seo.ai.summary}`,
    '',
    seo.ai.about,
    '',
    '## Service',
    '',
    seo.ai.service,
    '',
    `Site: ${seo.siteUrl}`,
    `Source: ${seo.organization.sameAs[0]}`,
    '',
    sections.join('\n\n'),
    '',
  ].join('\n')
}
