import { createElement, type CSSProperties } from 'react'

type TypeTitleProps = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  id?: string
  /** Milliseconds per character. */
  speed?: number
  /** Milliseconds before the first character, once the title is on screen. */
  delay?: number
  /** Leave the block cursor blinking after the line finishes. */
  persistCursor?: boolean
}

const LEVEL: Record<string, number> = { h1: 1, h2: 2, h3: 3 }

export function TypeTitle({
  text,
  as = 'span',
  className,
  id,
  speed = 28,
  delay = 160,
  persistCursor = false,
}: TypeTitleProps) {
  const level = LEVEL[as]
  return createElement(
    'type-title',
    {
      id,
      className,
      text,
      speed: String(speed),
      delay: String(delay),
      persist: persistCursor ? 'true' : 'false',
      role: level ? 'heading' : undefined,
      'aria-level': level,
      style: { display: level ? 'block' : 'inline' } as CSSProperties,
    },
    createElement('span', { className: 'type-title-fallback' }, text),
  )
}
