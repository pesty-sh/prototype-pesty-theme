'use client'

import { useEffect, useRef } from 'react'

const STEP = 10
const FADE_MS = 160
const PEAK = 0.28

/**
 * Undo: delete this file and remove <MouseType /> from app/layout.tsx.
 * One 16px cell follows the pointer. The tail is a fast shadow that fades by time.
 */
export function MouseType() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = root.current
    if (!host) return
    const page = window as Window & { __pestyMouseType?: boolean }
    if (page.__pestyMouseType) return
    page.__pestyMouseType = true
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.documentElement.classList.add('mouse-type')

    const caret = document.createElement('span')
    caret.className = 'mouse-cell is-caret'
    caret.setAttribute('aria-hidden', 'true')
    caret.hidden = true
    host.append(caret)

    const shadows: { el: HTMLSpanElement; born: number }[] = []
    let acc = 0
    let px = -1
    let py = -1
    let idle = 0
    let frame = 0

    const fade = (now: number) => {
      for (let i = shadows.length - 1; i >= 0; i -= 1) {
        const age = now - shadows[i].born
        if (age >= FADE_MS) {
          shadows[i].el.remove()
          shadows.splice(i, 1)
          continue
        }
        shadows[i].el.style.opacity = String(PEAK * (1 - age / FADE_MS))
      }
      frame = window.requestAnimationFrame(fade)
    }
    frame = window.requestAnimationFrame(fade)

    const drop = (x: number, y: number, now: number) => {
      const el = document.createElement('span')
      el.className = 'mouse-cell is-tail'
      el.setAttribute('aria-hidden', 'true')
      el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
      el.style.opacity = String(PEAK)
      host.append(el)
      shadows.push({ el, born: now })
    }

    const overHeader = (x: number, y: number) => {
      const header = document.getElementById('rust-header')
      if (!header) return false
      const rect = header.getBoundingClientRect()
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    }

    const onMove = (event: PointerEvent) => {
      const x = event.clientX
      const y = event.clientY
      if (overHeader(x, y)) {
        caret.hidden = true
        px = -1
        py = -1
        acc = 0
        for (let i = shadows.length - 1; i >= 0; i -= 1) shadows[i].el.remove()
        shadows.length = 0
        return
      }
      const now = performance.now()
      if (px >= 0) acc += Math.hypot(x - px, y - py)
      const fromX = px
      const fromY = py
      px = x
      py = y
      caret.hidden = false
      caret.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
      caret.classList.add('is-moving')
      window.clearTimeout(idle)
      idle = window.setTimeout(() => caret.classList.remove('is-moving'), 90)

      if (fromX < 0) return
      while (acc >= STEP) {
        acc -= STEP
        drop(fromX, fromY, now)
      }
    }

    const hide = () => {
      caret.hidden = true
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', hide)
    return () => {
      document.documentElement.classList.remove('mouse-type')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', hide)
      window.clearTimeout(idle)
      window.cancelAnimationFrame(frame)
      host.replaceChildren()
    }
  }, [])

  return <div ref={root} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true" />
}
