export type ReadmeSegment =
  | { kind: 'html'; html: string }
  | { kind: 'code'; code: string; lang: string }

const LANG: Record<string, string> = {
  shell: 'bash',
  'shell-session': 'bash',
  console: 'bash',
  bash: 'bash',
  sh: 'bash',
  zsh: 'zsh',
  rust: 'rust',
  toml: 'toml',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  markdown: 'md',
  md: 'md',
  text: 'text',
  plaintext: 'text',
  ts: 'ts',
  typescript: 'ts',
  js: 'js',
  javascript: 'js',
}

function langName(raw: string | undefined) {
  if (!raw) return null
  const key = raw.toLowerCase()
  return LANG[key] ?? key
}

function langFrom(attrs: string) {
  const source = attrs.match(/highlight-source-([a-z0-9+-]+)/i)?.[1]
  const language = attrs.match(/language-([a-z0-9+-]+)/i)?.[1]
  const explicit = attrs.match(/\blang="([^"]+)"/i)?.[1]
  return langName(source || language || explicit)
}

function decode(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/^\n/, '')
    .replace(/\n$/, '')
}

function inferLang(code: string) {
  const first = code.trimStart()
  if (/^(brew|sudo|echo|curl|npm|pnpm|cargo|git|\.\/|cd |export |apt )/.test(first) || first.includes('\\\n')) return 'bash'
  if (first.startsWith('{') || first.startsWith('[')) return 'json'
  if (first.startsWith('fn ') || first.startsWith('use ') || first.includes('fn main')) return 'rust'
  return 'text'
}

function closeDiv(html: string, start: number) {
  let depth = 0
  const re = /<\/?div\b[^>]*>/gi
  re.lastIndex = start
  let match: RegExpExecArray | null
  while ((match = re.exec(html))) {
    if (match[0].startsWith('</')) depth -= 1
    else depth += 1
    if (depth === 0) return match.index + match[0].length
  }
  return html.length
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

function balanceFragment(html: string) {
  const stack: string[] = []
  let out = ''
  const re = /<\/?([a-zA-Z][\w:-]*)(\s[^<>]*)?\/?>/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(html))) {
    out += html.slice(last, match.index)
    last = match.index + match[0].length
    const name = match[1].toLowerCase()
    const closing = match[0].startsWith('</')
    const selfClosing = match[0].endsWith('/>') || VOID_TAGS.has(name)
    if (closing) {
      const index = stack.lastIndexOf(name)
      if (index === -1) continue
      out += stack.splice(index).reverse().map((tag) => `</${tag}>`).join('')
      continue
    }
    out += match[0]
    if (!selfClosing) stack.push(name)
  }
  out += html.slice(last)
  return out + stack.reverse().map((tag) => `</${tag}>`).join('')
}

export function splitReadmeHtml(html: string): ReadmeSegment[] {
  const blocks: { start: number; end: number; code: string; lang: string }[] = []
  const re = /<div\b[^>]*class="([^"]*(?:highlight|snippet-clipboard)[^"]*)"[^>]*>|<pre\b([^>]*)>/gi
  let match: RegExpExecArray | null

  while ((match = re.exec(html))) {
    const isDiv = match[0].toLowerCase().startsWith('<div')
    if (isDiv) {
      const start = match.index
      const end = closeDiv(html, start)
      const inner = html.slice(start, end)
      const pre = inner.match(/<pre\b[^>]*>([\s\S]*?)<\/pre>/i)
      if (pre) {
        const code = decode(pre[1])
        blocks.push({
          start,
          end,
          code,
          lang: langFrom(match[1] + inner) ?? inferLang(code),
        })
      }
      re.lastIndex = end
      continue
    }

    const start = match.index
    const close = html.toLowerCase().indexOf('</pre>', start)
    if (close === -1) break
    const end = close + 6
    const code = decode(html.slice(html.indexOf('>', start) + 1, close))
    blocks.push({
      start,
      end,
      code,
      lang: langFrom(match[2] ?? '') ?? inferLang(code),
    })
    re.lastIndex = end
  }

  if (blocks.length === 0) return [{ kind: 'html', html }]

  const segments: ReadmeSegment[] = []
  let cursor = 0
  for (const block of blocks) {
    if (block.start < cursor) continue
    if (block.start > cursor) segments.push({ kind: 'html', html: balanceFragment(html.slice(cursor, block.start)) })
    segments.push({ kind: 'code', code: block.code, lang: block.lang })
    cursor = block.end
  }
  if (cursor < html.length) segments.push({ kind: 'html', html: balanceFragment(html.slice(cursor)) })
  return segments
}
