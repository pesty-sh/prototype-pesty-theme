'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, type ElementType } from 'react'

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

export function TypeTitle({
  text,
  as: Tag = 'span',
  className,
  id,
  speed = 28,
  delay = 160,
  persistCursor = false,
}: TypeTitleProps) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const [run, setRun] = useState(0)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || started) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setCount(text.length)
      setStarted(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        setStarted(true)
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started, text])

  useEffect(() => {
    if (!started) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setCount(text.length)
      return
    }
    let i = 0
    let timer = 0
    setCount(0)
    const tick = () => {
      i += 1
      setCount(i)
      if (i < text.length) timer = window.setTimeout(tick, speed)
    }
    timer = window.setTimeout(tick, run === 0 ? delay : 40)
    return () => window.clearTimeout(timer)
  }, [started, run, text, speed, delay])

  function retype(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setStarted(true)
    setRun((value) => value + 1)
  }

  const done = count >= text.length
  const Heading = Tag as ElementType

  return (
    <Heading id={id} ref={ref} className={className}>
      <button
        type="button"
        onClick={retype}
        title="Click to retype"
        className="relative z-10 grid w-full cursor-pointer text-left"
      >
        {/* Full line stays in the layout so wrapping does not jump as characters arrive. */}
        <span className="invisible col-start-1 row-start-1 text-balance" aria-hidden="true">
          {text}
        </span>
        <span className="col-start-1 row-start-1 text-balance" aria-hidden="true">
          {text.slice(0, count)}
          {started && (persistCursor || !done) && <span className="cursor ml-1" />}
        </span>
        <span className="sr-only">{text}. Click to retype.</span>
      </button>
    </Heading>
  )
}
