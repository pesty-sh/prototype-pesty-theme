import type { ReleaseAsset } from './github'

export type Platform = 'macOS' | 'Linux' | 'Debian / Ubuntu' | 'Windows' | 'Other'

export type Download = {
  name: string
  url: string
  size: number
  arch: string
  format: string
  checksumUrl?: string
}

const ORDER: Platform[] = ['macOS', 'Linux', 'Debian / Ubuntu', 'Windows', 'Other']

function archOf(name: string) {
  if (/universal/.test(name)) return 'Universal'
  if (/aarch64|arm64/.test(name)) return 'ARM64'
  if (/x86_64|amd64/.test(name)) return 'x86_64'
  if (/armv7|armhf/.test(name)) return 'ARMv7'
  if (/i686|i386/.test(name)) return 'x86 32-bit'
  return '—'
}

function platformOf(name: string): Platform {
  if (name.endsWith('.deb')) return 'Debian / Ubuntu'
  if (/apple-darwin|macos/.test(name)) return 'macOS'
  if (/windows/.test(name)) return 'Windows'
  if (/linux/.test(name)) return 'Linux'
  return 'Other'
}

function formatOf(name: string) {
  if (name.endsWith('.tar.gz')) return 'tar.gz'
  const ext = name.split('.').pop()
  return ext && ext !== name ? ext : 'file'
}

export function groupAssets(assets: ReleaseAsset[]) {
  const checksums = new Map(assets.filter((a) => a.name.endsWith('.sha256')).map((a) => [a.name, a.browser_download_url]))
  const sums = assets.find((a) => a.name === 'SHA256SUMS')
  const groups = new Map<Platform, Download[]>()

  for (const a of assets) {
    if (a.name.endsWith('.sha256') || a.name === 'SHA256SUMS') continue
    const platform = platformOf(a.name)
    const list = groups.get(platform) ?? []
    list.push({
      name: a.name,
      url: a.browser_download_url,
      size: a.size,
      arch: archOf(a.name),
      format: formatOf(a.name),
      checksumUrl: checksums.get(`${a.name}.sha256`),
    })
    groups.set(platform, list)
  }

  return {
    groups: ORDER.filter((p) => groups.has(p)).map((p) => ({ platform: p, downloads: groups.get(p)! })),
    sumsUrl: sums?.browser_download_url,
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatDate(iso: string | null | undefined) {
  return iso ? iso.slice(0, 10) : '—'
}
