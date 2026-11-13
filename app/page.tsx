import { BootLog } from '@/components/boot-log'
import { FeatureTable } from '@/components/feature-table'
import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'
import { SystemRequirements } from '@/components/system-requirements'
import { TopBar } from '@/components/top-bar'
import { WindowChrome } from '@/components/window-chrome'

export const dynamic = 'force-static'

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main id="top" className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-2 pt-2 pb-8 md:px-6 md:pt-6">
        <WindowChrome>
          <BootLog />
          <Hero />
          <FeatureTable />
          <SystemRequirements />
          <SiteFooter />
        </WindowChrome>
      </main>
    </div>
  )
}
