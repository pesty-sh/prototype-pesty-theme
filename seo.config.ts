/**
 * Search and share text. Edit this file, then redeploy.
 *
 * Titles here do not include "— pesty.sh". The site template adds that,
 * except on the homepage, which uses `home.title` as the full title.
 * Descriptions are the snippet under the link in search results. Aim for
 * one or two sentences, under about 160 characters.
 */

export type PageSeo = {
  title: string
  description: string
  keywords: string[]
}

export type ProjectSeo = {
  /** Short title. The site name is appended. */
  title?: string
  /** Snippet. Falls back to the project tagline in projects.config.ts. */
  description?: string
  keywords?: string[]
}

export const seo = {
  siteUrl: 'https://pesty.sh',
  siteName: 'pesty.sh',
  locale: 'en_US',
  /** Used when a page does not set its own title. */
  title: 'pesty.sh — Rust tools and developer services',
  titleTemplate: '%s — pesty.sh',
  description:
    'Small Rust tools for developers, and a service that builds and fixes software. Offline binaries, no telemetry. Install with Homebrew or apt.',
  keywords: [
    'Rust',
    'Rust CLI',
    'developer tools',
    'code tools',
    'offline tools',
    'developer services',
    'Homebrew',
    'Linux',
  ],
  /** summary is safe without a large share image. Use summary_large_image after adding a 1200×630 png. */
  twitterCard: 'summary' as const,
  /** Optional. A PNG at 1200×630 shares better than the icon. */
  image: '/icon.svg',

  organization: {
    name: 'pesty.sh',
    description:
      'A developer service that ships small Rust tools and builds or fixes software. The tools run offline, with no telemetry.',
    knowsAbout: ['Rust', 'command-line tools', 'developer tools', 'software development'],
    sameAs: ['https://github.com/pesty-sh'],
  },

  home: {
    title: 'pesty.sh — Rust tools and developer services',
    description:
      'Small Rust tools for developers, and a service that builds and fixes software. Offline binaries, no telemetry. Install with Homebrew or apt.',
    keywords: ['Rust tools', 'code tools', 'developer service', 'offline CLI'],
  } satisfies PageSeo,

  /**
   * One entry per project slug. Missing fields fall back to the repo name
   * and the tagline in projects.config.ts.
   */
  projects: {
    qrbin: {
      title: 'qrbin, offline QR codes in Rust',
      description:
        'Offline QR code generator written in Rust. It runs on your machine with no network access and no telemetry. Install with Homebrew or apt.',
      keywords: ['QR code generator', 'offline QR', 'Rust QR'],
    },
    smashbin: {
      title: 'smashbin, offline images in Rust',
      description:
        'Offline image tool written in Rust. Resize pictures and strip metadata on your machine. No uploads and no telemetry.',
      keywords: ['image resizer', 'strip image metadata', 'Rust image tool'],
    },
    rmbin: {
      title: 'rmbin, overwrite and delete in Rust',
      description:
        'A Rust tool that overwrites a file, syncs it to disk, then deletes it. Honest about what an SSD can and cannot guarantee.',
      keywords: ['secure delete', 'file shredder', 'Rust delete tool'],
    },
    'prototype-event-voter': {
      title: 'Event suggestion voter',
      description: 'A prototype for collecting event suggestions and voting on them.',
      keywords: ['event voting', 'prototype'],
    },
    'prototype-pesty-header': {
      title: 'Rust pixel header',
      description: 'A Rust and WebAssembly pixel header: pointer, motion, and the pesty.sh wordmark.',
      keywords: ['WebAssembly', 'pixel header', 'Rust wasm'],
    },
  } satisfies Record<string, ProjectSeo>,

  /**
   * Text served at /llms.txt and /llms-full.txt for AI crawlers.
   * Tool names and links are filled in from the project list.
   * `crawlers` are named explicitly in robots.txt. `*` is already allowed.
   */
  ai: {
    summary:
      'pesty.sh builds small Rust tools for developers and takes on work to build or fix software. The tools are offline binaries with no telemetry.',
    about:
      'pesty.sh is a developer service and a set of code tools. The published tools are single Rust binaries for everyday jobs: QR codes, images, and file deletion. They run on the machine in front of you. They do not send telemetry and they do not need an account. The same practice applies to client work: build the thing, fix the thing, and leave out the tracking.',
    service:
      'The service side is software work for developers and teams: new tools, repairs, and small Rust programs shipped as binaries. The public tools on this site are free to install.',
    crawlers: [
      'GPTBot',
      'ChatGPT-User',
      'OAI-SearchBot',
      'ClaudeBot',
      'Claude-User',
      'Claude-SearchBot',
      'anthropic-ai',
      'PerplexityBot',
      'Perplexity-User',
      'Google-Extended',
      'Applebot-Extended',
      'Amazonbot',
      'meta-externalagent',
      'cohere-ai',
    ],
  },
}
