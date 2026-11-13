import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/lib/github'
import { formatDate } from '@/lib/release-assets'

export function ProjectTile({ project }: { project: Project }) {
  const { release } = project
  return (
    <article className="tile group relative flex flex-col" aria-labelledby={`p-${project.slug}`}>
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-1.5 font-mono text-xs text-muted-foreground">
        <span className="truncate">~/{project.slug}</span>
        <span className="shrink-0">{project.language ?? 'repo'}</span>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-4 py-5">
        <h3 id={`p-${project.slug}`} className="text-2xl leading-none tracking-tight">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {project.name}
          </Link>
        </h3>
        <p className="leading-relaxed text-pretty text-muted-foreground">{project.tagline}</p>
        <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
          <dt className="text-muted-foreground">latest</dt>
          <dd className={release ? 'text-accent' : 'text-muted-foreground'}>{release?.tag_name ?? 'no release'}</dd>
          <dt className="text-muted-foreground">released</dt>
          <dd>{formatDate(release?.published_at)}</dd>
          <dt className="text-muted-foreground">binaries</dt>
          <dd>{release ? release.assets.filter((a) => !/sha256|SHA256SUMS/.test(a.name)).length : 0}</dd>
        </dl>
      </div>
      <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 font-mono text-xs">
        <span className="text-muted-foreground group-hover:text-accent">open details</span>
        <ArrowUpRight className="size-4 text-border group-hover:text-accent" aria-hidden="true" />
      </div>
    </article>
  )
}
