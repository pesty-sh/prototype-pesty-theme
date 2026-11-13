import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/lib/github'
import { formatDate } from '@/lib/release-assets'
import { ProjectMark } from './project-mark'
import { TypeTitle } from './type-title'

export function ProjectTile({ project, index = 0 }: { project: Project; index?: number }) {
  const { release } = project
  return (
    <article className="tile group relative flex flex-col" aria-labelledby={`p-${project.slug}`}>
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`Open ${project.name}`}
        className="absolute inset-0 z-0 focus-visible:outline-2"
      />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border/40 px-6 py-1.5 font-mono text-xs text-muted-foreground">
          <span className="truncate">~/{project.slug}</span>
          <span className="shrink-0">{project.language ?? 'repo'}</span>
        </div>
        <div className="panel-body flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-3">
            <ProjectMark slug={project.slug} size={72} />
            <h3 id={`p-${project.slug}`} className="pointer-events-auto relative z-20 min-w-0 text-2xl leading-none tracking-tight">
              <TypeTitle text={project.name} delay={80 + index * 70} speed={24} />
            </h3>
          </div>
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
        <div className="flex items-center justify-between border-t border-border/40 px-6 py-4 font-mono text-xs">
          <span className="text-muted-foreground group-hover:text-accent">open details</span>
          <ArrowUpRight className="size-4 text-border group-hover:text-accent" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
}
