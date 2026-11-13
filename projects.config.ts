/**
 * Project registry. Two ways to add a project:
 *
 * 1. Do nothing — with `autoDiscover: true`, every public repo under `owner`
 *    shows up automatically (minus `exclude`), using its GitHub description.
 * 2. Add an entry to `projects` to pin its order and override copy / install channels.
 *
 * Data (description, language, latest release + downloads, README) is pulled from
 * GitHub and cached for `revalidateSeconds`. Set GITHUB_TOKEN to raise API limits.
 */

export type InstallChannel = 'brew' | 'apt'

export type ProjectConfig = {
  /** GitHub repo name under `owner` — also the URL slug: /projects/<repo> */
  repo: string
  /** One-liner for tiles. Falls back to the GitHub description. */
  tagline?: string
  /** Package managers that ship this project */
  channels?: InstallChannel[]
  /** Short warning shown on the project page */
  note?: string
  /** Image shown beside the project title. Path in /public. */
  mark?: string
  markAlt?: string
}

export const siteConfig = {
  owner: 'pesty-sh',
  bio: 'Build anything. Fix everything. One binary. No meetings.',
  autoDiscover: true,
  exclude: ['apt', 'homebrew-tap', '.github', 'prototype-pesty-theme'],
  revalidateSeconds: 3600,
  brewTap: 'pesty-sh/tap',
  aptRepo: 'https://pesty-sh.github.io/apt',
}

export const projects: ProjectConfig[] = [
  {
    repo: 'qrbin',
    tagline: 'Offline-first QR generator. No telemetry, no network access.',
    channels: ['brew', 'apt'],
  },
  {
    repo: 'smashbin',
    tagline: 'Offline image smasher. Strips metadata and resizes.',
    channels: ['brew', 'apt'],
  },
  {
    repo: 'rmbin',
    tagline: 'Overwrites, syncs to disk, then deletes. Honest about SSDs.',
    channels: ['brew', 'apt'],
    note: 'Alpha. rmbin permanently destroys data by design. Try --dry-run first, on throwaway files.',
  },
  {
    repo: 'prototype-event-voter',
    tagline: 'Prototype app for event suggestions.',
  },
  {
    repo: 'prototype-pesty-header',
    tagline: 'Pixel header tutorial: pointer, motion, and the pesty.sh wordmark.',
  },
]
