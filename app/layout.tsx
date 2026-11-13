import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { MouseType } from '@/components/mouse-type'
import { HashScroll } from '@/components/top-bar'
import { palette, paletteToCssVars } from '@/theme.config'
import { siteConfig } from '@/projects.config'
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pesty.sh'),
  title: { default: 'Pesty — pesty.sh', template: '%s — pesty.sh' },
  description: siteConfig.bio,
  openGraph: {
    title: 'Pesty — pesty.sh',
    description: siteConfig.bio,
    url: 'https://pesty.sh',
    siteName: 'pesty.sh',
    images: ['/brand/pesty-wordmark.png'],
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
        <HashScroll />
        <MouseType />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
