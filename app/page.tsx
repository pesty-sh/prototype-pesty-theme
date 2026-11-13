/*
import { BootLog } from '@/components/boot-log'
import { Hero } from '@/components/hero'
*/
import { InstallChannels } from '@/components/install-channels'
import { ProjectTile } from '@/components/project-tile'
import { SiteFooter } from '@/components/site-footer'
import { Tile } from '@/components/tile'
import { FeatureHeader } from '@/components/feature-header'
import { TypeTitle } from '@/components/type-title'
import { JsonLd } from '@/components/json-ld'
import { getProjects } from '@/lib/github'
import { pageMetadata } from '@/lib/seo'
import { seo } from '@/seo.config'

export const revalidate = 3600

export const metadata = pageMetadata(seo.home)

export default async function Page() {
  const projects = await getProjects()

  return (
    <div id="top" className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip bg-background">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: seo.home.title, description: seo.home.description, url: seo.siteUrl }} />
      <FeatureHeader />
      <main className="mx-auto mt-2 flex w-full max-w-6xl flex-1 flex-col gap-2 px-2 pb-2 md:mt-3 md:gap-3 md:px-3">
        {/*
        <div className="grid gap-2 md:grid-cols-3 md:gap-3">
          <Hero />
          <BootLog projects={projects} />
        </div>
        */}

        <section id="projects" aria-labelledby="projects-title" className="flex scroll-mt-4 flex-col gap-2 md:gap-3">
          <h2 id="projects-title" className="sr-only">
            Projects
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-4">
            {projects.map((p, index) => (
              <ProjectTile key={p.slug} project={p} index={index} />
            ))}
          </div>
        </section>

        <Tile id="install" title="~/install — zsh" labelledBy="install-title" className="scroll-mt-4">
          <div className="flex min-w-0 flex-col gap-6">
            <TypeTitle as="h2" id="install-title" text="One binary. Your package manager." className="text-3xl tracking-tight" />
            <InstallChannels />
          </div>
        </Tile>
      </main>
      <SiteFooter />
    </div>
  )
}
