import { llmsIndex } from '@/lib/ai-index'

export const revalidate = 3600

export async function GET() {
  return new Response(await llmsIndex(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
