import { BootLog } from '@/components/boot-log'
import { Hero } from '@/components/hero'
import { InstallChannels } from '@/components/install-channels'
import { ProjectTile } from '@/components/project-tile'
import { SiteFooter } from '@/components/site-footer'
import { Tile } from '@/components/tile'
import { TopBar } from '@/components/top-bar'
import { getProjects } from '@/lib/github'

export const revalidate = 3600

export default async function Page() {
  const projects = await getProjects()

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 md:gap-3 md:px-3">
        <div className="grid gap-2 md:grid-cols-3 md:gap-3">
          <Hero />
          <BootLog projects={projects} />
        </div>

        <section id="projects" aria-labelledby="projects-title" className="flex scroll-mt-4 flex-col gap-2 md:gap-3">
          <h2 id="projects-title" className="sr-only">
            Projects
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-4">
            {projects.map((p) => (
              <ProjectTile key={p.slug} project={p} />
            ))}
          </div>
        </section>

        <Tile id="install" title="~/install — zsh" labelledBy="install-title" className="scroll-mt-4">
          <div className="flex flex-col gap-6 px-5 py-6 md:px-8">
            <h2 id="install-title" className="text-3xl tracking-tight">
              One binary. Your package manager.
            </h2>
            <InstallChannels />
          </div>
        </Tile>
      </main>
      <SiteFooter />
    </div>
  )
}
