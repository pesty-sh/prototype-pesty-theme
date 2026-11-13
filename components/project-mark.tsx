import Link from 'next/link'
import { projectQrAlt, projectQrSrc } from '@/lib/project-qr'

export function ProjectMark({ slug, size = 72 }: { slug: string; size?: number }) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="pointer-events-auto shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <img
        src={projectQrSrc(slug)}
        alt={projectQrAlt(slug)}
        width={size}
        height={size}
        className="border border-border bg-background"
        style={{ width: size, height: size }}
      />
    </Link>
  )
}
