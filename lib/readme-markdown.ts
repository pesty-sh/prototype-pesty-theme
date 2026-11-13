function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function safeHref(href: string) {
  return href.startsWith('#') || href.startsWith('/') || /^https?:\/\//i.test(href)
}

function inline(raw: string) {
  const tokens: string[] = []
  const stash = (html: string) => {
    tokens.push(html)
    return `\u0000${tokens.length - 1}\u0000`
  }

  let text = raw.replace(/(`+)([^`]*?)\1/g, (_match, _ticks, code: string) => stash(`<code>${escapeHtml(code)}</code>`))
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => {
    if (!safeHref(href)) return stash(escapeHtml(label))
    return stash(`<a href="${escapeHtml(href)}">${inline(label)}</a>`)
  })
  text = text.replace(/<((?:https?:\/\/)[^>\s]+)>/g, (_match, href: string) =>
    stash(`<a href="${escapeHtml(href)}">${escapeHtml(href)}</a>`),
  )
  text = escapeHtml(text)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  return text.replace(/\u0000(\d+)\u0000/g, (_match, index) => tokens[Number(index)] ?? '')
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function tableCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isFence(line: string) {
  return line.startsWith('```')
}

function isHeading(line: string) {
  return /^#{1,4}\s+/.test(line)
}

function isBullet(line: string) {
  return /^[-*]\s+/.test(line)
}

function isNumbered(line: string) {
  return /^\d+\.\s+/.test(line)
}

function isTable(line: string) {
  return line.trim().startsWith('|')
}

/** GitHub-flavoured subset used by the project READMEs: headings, lists, tables, fences, links. */
export function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (isFence(line)) {
      const lang = line.slice(3).trim()
      const code: string[] = []
      index += 1
      while (index < lines.length && !isFence(lines[index])) {
        code.push(lines[index])
        index += 1
      }
      index += 1
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : ''
      out.push(`<pre><code${cls}>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    if (isTable(line)) {
      const rows: string[][] = []
      while (index < lines.length && isTable(lines[index])) {
        if (!isTableDivider(lines[index])) rows.push(tableCells(lines[index]))
        index += 1
      }
      if (rows.length === 0) continue
      const [head, ...body] = rows
      const headHtml = head.map((cell) => `<th>${inline(cell)}</th>`).join('')
      const bodyHtml = body
        .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`)
        .join('')
      out.push(`<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`)
      continue
    }

    if (isHeading(line)) {
      const match = /^(#{1,4})\s+(.*)$/.exec(line)
      if (!match) {
        index += 1
        continue
      }
      const level = match[1].length
      out.push(`<h${level}>${inline(match[2])}</h${level}>`)
      index += 1
      continue
    }

    if (isBullet(line)) {
      const items: string[] = []
      while (index < lines.length && isBullet(lines[index])) {
        items.push(`<li>${inline(lines[index].replace(/^[-*]\s+/, ''))}</li>`)
        index += 1
      }
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    if (isNumbered(line)) {
      const items: string[] = []
      while (index < lines.length && isNumbered(lines[index])) {
        items.push(`<li>${inline(lines[index].replace(/^\d+\.\s+/, ''))}</li>`)
        index += 1
      }
      out.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    if (line.trim() === '') {
      index += 1
      continue
    }

    const paragraph: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !isFence(lines[index]) &&
      !isTable(lines[index]) &&
      !isHeading(lines[index]) &&
      !isBullet(lines[index]) &&
      !isNumbered(lines[index])
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    out.push(`<p>${inline(paragraph.join(' '))}</p>`)
  }

  return out.join('\n')
}
