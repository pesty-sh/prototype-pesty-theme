import { ArrowLeft, ExternalLink, TriangleAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { InstallChannels } from '@/components/install-channels'
import { ReleaseDownloads } from '@/components/project/release-downloads'
import { SiteFooter } from '@/components/site-footer'
import { Tile } from '@/components/tile'
import { TopBar } from '@/components/top-bar'
import { getProject, getProjectSlugs, getReadmeHtml } from '@/lib/github'
import { formatDate } from '@/lib/release-assets'

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Not found' }
  return { title: project.name, description: project.tagline }
}

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params
  const [project, readme] = await Promise.all([getProject(slug), getReadmeHtml(slug)])
  if (!project) notFound()

  const { release } = project
  const facts: [string, React.ReactNode][] = [
    ['latest', release?.tag_name ?? 'no release'],
    ['released', formatDate(release?.published_at)],
    ['language', project.language ?? '—'],
    ['license', project.license ?? '—'],
    ['last push', formatDate(project.pushedAt)],
    ['stars', project.stars],
  ]

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar current="projects" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 md:gap-3 md:px-3">
        <div className="grid gap-2 md:grid-cols-3 md:gap-3">
          <Tile title={`~/${project.slug}`} meta="NORMAL" active className="md:col-span-2" labelledBy="project-title">
            <div className="flex flex-col gap-6 px-5 py-8 md:px-8">
              <Link
                href="/#projects"
                className="flex w-fit items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-accent"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                all projects
              </Link>
              <h1 id="project-title" className="text-5xl leading-none tracking-tight md:text-7xl">
                {project.name}
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-pretty">{project.tagline}</p>
              {project.note && (
                <p className="flex max-w-xl items-start gap-2 border-l-2 border-accent bg-surface px-3 py-2 text-sm leading-relaxed">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {project.note}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                {release && (
                  <a
                    href="#downloads"
                    className="border-2 border-accent bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-background hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Download {release.tag_name}
                  </a>
                )}
                <a
                  href={project.url}
                  rel="noreferrer"
                  className="flex items-center gap-1.5 border-2 border-border px-5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Source
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
                {project.homepage && (
                  <a
                    href={project.homepage}
                    rel="noreferrer"
                    className="flex items-center gap-1.5 border-2 border-border px-5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Live demo
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </Tile>

          <Tile title="stat" meta={project.slug}>
            <dl className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2 px-4 py-5 font-mono text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className={k === 'latest' && release ? 'text-accent' : undefined}>{v}</dd>
                </div>
              ))}
            </dl>
            {project.topics.length > 0 && (
              <ul className="flex flex-wrap gap-2 border-t border-border/40 px-4 py-3 font-mono text-xs">
                {project.topics.map((t) => (
                  <li key={t} className="border border-border px-2 py-0.5 text-muted-foreground">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </Tile>
        </div>

        <Tile
          id="downloads"
          title={release ? `releases/${release.tag_name}` : 'releases'}
          meta={
            release && (
              <a href={release.html_url} rel="noreferrer" className="hover:text-accent">
                release notes
              </a>
            )
          }
          labelledBy="downloads-title"
          className="scroll-mt-4"
        >
          <div className="flex flex-col gap-6 px-5 py-6 md:px-8">
            <h2 id="downloads-title" className="text-3xl tracking-tight">
              {release ? `Downloads — ${release.tag_name}` : 'Downloads'}
            </h2>
            {release ? (
              <ReleaseDownloads release={release} />
            ) : (
              <p className="text-muted-foreground">
                No GitHub release yet.{' '}
                <a href={project.url} rel="noreferrer" className="text-border underline hover:text-accent">
                  Grab the source
                </a>
                .
              </p>
            )}
          </div>
        </Tile>

        {project.channels.length > 0 && (
          <Tile title="~/install — zsh" labelledBy="install-title">
            <div className="flex flex-col gap-6 px-5 py-6 md:px-8">
              <h2 id="install-title" className="text-3xl tracking-tight">
                Install with a package manager
              </h2>
              <InstallChannels pkg={project.slug} />
            </div>
          </Tile>
        )}

        {readme && (
          <Tile title="README.md" meta="github" labelledBy="readme-title">
            <div className="px-5 py-6 md:px-8">
              <h2 id="readme-title" className="sr-only">
                README
              </h2>
              {/* HTML is rendered and sanitized by GitHub's README API */}
              <div className="readme max-w-3xl" dangerouslySetInnerHTML={{ __html: readme }} />
            </div>
          </Tile>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
