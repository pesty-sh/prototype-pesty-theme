import { siteConfig } from '@/projects.config'
import { CommandLine } from './copy-button'

export function aptSetupCommands() {
  return [
    `curl -fsSL ${siteConfig.aptRepo}/pesty-archive-keyring.gpg | sudo tee /usr/share/keyrings/pesty-archive-keyring.gpg >/dev/null`,
    `echo "deb [signed-by=/usr/share/keyrings/pesty-archive-keyring.gpg] ${siteConfig.aptRepo} stable main" | sudo tee /etc/apt/sources.list.d/pesty.list`,
    'sudo apt-get update',
  ]
}

export function InstallChannels({ pkg = '<name>' }: { pkg?: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-lg">Homebrew</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">macOS and Linux. Builds from the tagged source.</p>
        <CommandLine command={`brew install ${siteConfig.brewTap}/${pkg}`} />
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-lg">apt</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Ubuntu 18.04+ and Debian 10+. Signed repo — add it once.
        </p>
        <div className="flex flex-col gap-px">
          {[...aptSetupCommands(), `sudo apt-get install ${pkg}`].map((c) => (
            <CommandLine key={c} command={c} />
          ))}
        </div>
      </div>
    </div>
  )
}
