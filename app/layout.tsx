import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pesty.sh'),
  title: 'PESTY.SH — Build anything. Fix everything.',
  description:
    'What can we build? Anything. What can we fix? Everything. What will it cost? Our dignity.',
  openGraph: {
    title: 'PESTY.SH',
    description: 'Build anything. Fix everything. Cost: our dignity.',
    url: 'https://pesty.sh',
    siteName: 'pesty.sh',
    images: ['/pesty-bug.png'],
  },
  icons: {
    icon: '/pesty-bug.png',
    apple: '/pesty-bug.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
