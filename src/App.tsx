import { useState } from 'react'
import type { LenseResponse } from './shared/schema.js'
import { ResultRenderer } from './components/ResultRenderer.js'
import './App.css'

function App() {
  const [intent, setIntent] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LenseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const query = intent.trim()
    if (!query || loading) return

    setIntent('')
    setResults(null)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/lense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: query }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      const data: LenseResponse = await res.json()
      setResults(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

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
        <div className="lense-loader" aria-label="Loading">
          <div className="lense-spinner" />
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
