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
    <div className="flex items-start justify-between gap-3 bg-surface px-3 py-2 font-mono text-sm">
      <code className="min-w-0 overflow-x-auto whitespace-pre">
        <span className="select-none text-border" aria-hidden="true">
          {'$ '}
        </span>
        {command}
      </code>
      <CopyButton value={command} />
    </div>
  )
}
