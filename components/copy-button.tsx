'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ value, label = 'Copy command' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-accent focus-visible:outline-2"
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span className="sr-only">{copied ? 'Copied' : label}</span>
    </button>
  )
}

export function CommandLine({ command }: { command: string }) {
  return (
    <div className="flex min-w-0 items-stretch bg-surface font-mono text-sm">
      <div className="min-w-0 flex-1 overflow-x-auto px-3 py-2" tabIndex={0}>
        <code className="whitespace-nowrap">
          <span className="select-none text-border" aria-hidden="true">
            {'$ '}
          </span>
          {command}
        </code>
      </div>
      <div className="flex shrink-0 items-center border-l border-border/40 px-1">
        <CopyButton value={command} />
      </div>
    </div>
  )
}
