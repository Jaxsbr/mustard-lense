import { useEffect, useRef, useState } from 'react'
import type { LenseResponse } from './shared/schema.js'
import { ResultRenderer } from './components/ResultRenderer.js'
import './App.css'

type Stage = 'idle' | 'retrieving' | 'thinking'

interface StageLogEntry {
  label: string
  detail: string
}

function ElapsedTimer() {
  const startRef = useRef(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startRef.current), 100)
    return () => clearInterval(id)
  }, [])

  const seconds = (elapsed / 1000).toFixed(1)
  return <span className="lense-elapsed">{seconds}s</span>
}

function parseSSEEvents(text: string): Array<{ event: string; data: string }> {
  const events: Array<{ event: string; data: string }> = []
  const parts = text.split('\n\n').filter(Boolean)
  for (const part of parts) {
    const lines = part.split('\n')
    let event = ''
    let data = ''
    for (const line of lines) {
      if (line.startsWith('event: ')) event = line.slice(7)
      if (line.startsWith('data: ')) data = line.slice(6)
    }
    if (event) events.push({ event, data })
  }
  return events
}

function App() {
  const [intent, setIntent] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [stageLog, setStageLog] = useState<StageLogEntry[]>([])
  const [results, setResults] = useState<LenseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const query = intent.trim()
    if (!query || stage !== 'idle') return

    setIntent('')
    setResults(null)
    setError(null)
    setStageLog([])
    setStage('retrieving')

    try {
      const res = await fetch('/api/lense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: query }),
      })

      // Intent validation returns 400 JSON before opening stream
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Process complete events from buffer
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          if (!part.trim()) continue
          const events = parseSSEEvents(part + '\n\n')
          for (const evt of events) {
            if (evt.event === 'retrieving') {
              setStage('retrieving')
            } else if (evt.event === 'thinking') {
              const info = JSON.parse(evt.data) as { retrieveMs?: number; recordCount?: number }
              setStageLog(prev => [...prev, {
                label: 'Retrieved',
                detail: `${info.recordCount ?? '?'} records in ${info.retrieveMs ?? '?'}ms`,
              }])
              setStage('thinking')
            } else if (evt.event === 'result') {
              const data: LenseResponse = JSON.parse(evt.data)
              setResults(data)
              setStage('idle')
            } else if (evt.event === 'error') {
              const data = JSON.parse(evt.data)
              throw new Error(data.error ?? 'Processing failed')
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setStage('idle')
    }
  }

  const loading = stage === 'retrieving' || stage === 'thinking'
  const showEmptyState = !loading && !results && !error

  return (
    <main>
      <h1>Mustard Lense</h1>

      <form className="lense-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className={`lense-input${loading ? ' lense-input--loading' : ''}`}
          placeholder="What would you like to see?"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          disabled={loading}
          aria-label="Lense intent input"
        />
      </form>

      {loading && (
        <div className="lense-stage" aria-label="Processing stage">
          {stageLog.map((entry, i) => (
            <div key={i} className="lense-stage-done">
              <span className="lense-stage-check">&#10003;</span>
              <span>{entry.label} &mdash; {entry.detail}</span>
            </div>
          ))}
          <div className="lense-stage-indicator">
            <div className="lense-spinner" />
            <span className="lense-stage-text" key={stage}>
              {stage === 'retrieving' ? 'Finding records...' : <>Thinking... <ElapsedTimer /></>}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="lense-error" role="alert">
          {error}
        </div>
      )}

      {results && (
        <div className="lense-results">
          {results.components.map((component, i) => (
            <div key={i} className="lense-result-item">
              <ResultRenderer component={component} />
            </div>
          ))}
        </div>
      )}

      {showEmptyState && (
        <blockquote>
          <p>
            He told them another parable: &ldquo;The kingdom of heaven is like a mustard
            seed, which a man took and planted in his field. Though it is the
            smallest of all seeds, yet when it grows, it is the largest of garden
            plants and becomes a tree, so that the birds come and perch in its
            branches.&rdquo;
          </p>
          <footer>&mdash; Matthew 13:31&ndash;32</footer>
        </blockquote>
      )}
    </main>
  )
}

export default App
