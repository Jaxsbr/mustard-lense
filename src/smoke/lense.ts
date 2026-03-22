// On-demand smoke test — lense E2E (SSE stream)
// Requires: API server running on port 3001 (npm run dev:server)
// Requires: real claude CLI and mustard data store at ~/dev/mustard/data/

const API_URL = 'http://localhost:3001/api/lense'
const INTENT = "what's going on this week"

async function checkServer(): Promise<void> {
  try {
    await fetch(API_URL, { method: 'HEAD' })
  } catch (err) {
    if (err instanceof TypeError && (err as NodeJS.ErrnoException).cause) {
      const cause = (err as NodeJS.ErrnoException).cause as NodeJS.ErrnoException
      if (cause?.code === 'ECONNREFUSED') {
        console.error('API server is not running.')
        console.error('Start it first:  npm run dev:server')
        process.exit(1)
      }
    }
    throw err
  }
}

interface SSEEvent {
  event: string
  data: string
}

async function readSSEStream(res: Response): Promise<SSEEvent[]> {
  const events: SSEEvent[] = []
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      if (!part.trim()) continue
      const lines = part.split('\n')
      let event = ''
      let data = ''
      for (const line of lines) {
        if (line.startsWith('event: ')) event = line.slice(7)
        if (line.startsWith('data: ')) data = line.slice(6)
      }
      if (event) events.push({ event, data })
    }
  }

  return events
}

async function main() {
  await checkServer()

  console.log(`Sending intent: "${INTENT}"`)
  console.log(`To: ${API_URL}\n`)

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent: INTENT }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`HTTP ${res.status}: ${body}`)
    process.exit(1)
  }

  const events = await readSSEStream(res)
  console.log(`SSE events received: ${events.map((e) => e.event).join(' → ')}`)

  // Check for error event
  const errorEvent = events.find((e) => e.event === 'error')
  if (errorEvent) {
    console.error('Server returned error event:', errorEvent.data)
    process.exit(1)
  }

  // Extract result event
  const resultEvent = events.find((e) => e.event === 'result')
  if (!resultEvent) {
    console.error('No result event in SSE stream')
    process.exit(1)
  }

  const data = JSON.parse(resultEvent.data)

  if (!data.components || !Array.isArray(data.components)) {
    console.error('Result event missing components array:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  if (data.components.length === 0) {
    console.error('Result has empty components array')
    process.exit(1)
  }

  const types = data.components.map((c: { type: string }) => c.type)
  console.log(`Components returned: ${data.components.length}`)
  console.log(`Types: ${types.join(', ')}`)
  console.log('\nSmoke test passed.')
}

main().catch((err) => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
