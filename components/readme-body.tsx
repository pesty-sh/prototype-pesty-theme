import { splitReadmeHtml } from '@/lib/readme-blocks'
import { CodeBlock } from './code-block'

export function ReadmeBody({ html }: { html: string }) {
  const segments = splitReadmeHtml(html)

  return (
    <div className="readme max-w-3xl">
      {segments.map((segment, index) =>
        segment.kind === 'code' ? (
          <CodeBlock key={index} code={segment.code} lang={segment.lang} />
        ) : (
          <div key={index} dangerouslySetInnerHTML={{ __html: segment.html }} />
        ),
      )}
    </div>
  )
}
