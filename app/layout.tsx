import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { MouseType } from '@/components/mouse-type'
import { HashScroll } from '@/components/top-bar'
import { mouseTypeBoot } from '@/lib/mouse-type-boot'
import { rustHeaderBoot } from '@/lib/rust-header-boot'
import { typeTitleBoot } from '@/lib/type-title-boot'
import { JsonLd } from '@/components/json-ld'
import { siteJsonLd } from '@/lib/seo'
import { release } from '@/lib/release'
import { seo } from '@/seo.config'
import { palette, paletteToCssVars } from '@/theme.config'
import './globals.css'

const satoshi = localFont({
  src: './fonts/Satoshi-Bold.woff2',
  weight: '700',
  variable: '--font-satoshi',
  display: 'swap',
})

const switzer = localFont({
  src: [
    { path: './fonts/Switzer-Regular.woff2', weight: '400' },
    { path: './fonts/Switzer-Medium.woff2', weight: '500' },
  ],
  variable: '--font-switzer',
  display: 'swap',
})

const jetbrainsMono = localFont({
  src: './fonts/JetBrainsMono-Regular.woff2',
  weight: '400',
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: { default: seo.title, template: seo.titleTemplate },
  description: seo.description,
  keywords: seo.keywords,
  applicationName: seo.siteName,
  other: { version: release },
  authors: [{ name: seo.siteName, url: seo.siteUrl }],
  creator: seo.siteName,
  robots: { index: true, follow: true },
  alternates: {
    canonical: seo.siteUrl,
    types: { 'text/markdown': new URL('/llms.txt', seo.siteUrl).toString() },
  },
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: seo.siteUrl,
    siteName: seo.siteName,
    locale: seo.locale,
    type: 'website',
    images: seo.image ? [{ url: seo.image }] : undefined,
  },
  twitter: {
    card: seo.twitterCard,
    title: seo.title,
    description: seo.description,
  },
  icons: {
    icon: [{ url: '/brand/pesty-mark.png', type: 'image/png' }],
    apple: [{ url: '/brand/pesty-mark.png', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: palette.desktop,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-desktop ${satoshi.variable} ${switzer.variable} ${jetbrainsMono.variable}`}
      style={paletteToCssVars(palette) as React.CSSProperties}
    >
      <body className="antialiased">
        <JsonLd data={siteJsonLd()} />
        <script dangerouslySetInnerHTML={{ __html: typeTitleBoot + '\n' + rustHeaderBoot + '\n' + mouseTypeBoot }} />
        <HashScroll />
        <MouseType />
        {children}
      </body>
    </html>
  )
}
