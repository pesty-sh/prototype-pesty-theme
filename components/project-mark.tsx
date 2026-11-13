import { projectQrAlt, projectQrSrc } from '@/lib/project-qr'

export function ProjectMark({ slug, size = 72 }: { slug: string; size?: number }) {
  return (
    <img
      src={projectQrSrc(slug)}
      alt={projectQrAlt(slug)}
      width={size}
      height={size}
      className="shrink-0 border border-border bg-background"
      style={{ width: size, height: size }}
    />
  )
}
