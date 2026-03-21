import express from 'express'
import type { RetrievedRecord } from './rag/retriever.js'
import type { Synthesiser } from './synthesiser.js'
import type { IndexResult } from './rag/indexer.js'

const MAX_INTENT_LENGTH = 2000

export interface AppDependencies {
  retrieve: (query: string, k?: number) => Promise<RetrievedRecord[]>
  synthesiser: Synthesiser
  buildIndex: (dataPath?: string) => Promise<IndexResult>
}

export function createApp(deps: AppDependencies) {
  const app = express()
  app.use(express.json())

  app.post('/api/lense', async (req, res) => {
    const { intent } = req.body ?? {}

    if (typeof intent !== 'string' || intent.trim() === '') {
      res.status(400).json({ error: 'Missing or empty intent field.' })
      return
    }

    if (intent.length > MAX_INTENT_LENGTH) {
      res.status(400).json({ error: `Intent exceeds maximum length of ${MAX_INTENT_LENGTH} characters.` })
      return
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const sendEvent = (event: string, data: string) => {
      res.write(`event: ${event}\ndata: ${data}\n\n`)
    }

    try {
      // Stage: retrieving
      sendEvent('retrieving', '{}')
      const startRetrieve = Date.now()
      const records = await deps.retrieve(intent)
      const retrieveMs = Date.now() - startRetrieve
      console.log(`[lense] retrieval: ${retrieveMs}ms (${records.length} records)`)

      // Stage: thinking
      sendEvent('thinking', '{}')
      const startSynth = Date.now()
      const result = await deps.synthesiser.synthesise(intent, records)
      const synthMs = Date.now() - startSynth
      console.log(`[lense] synthesis: ${synthMs}ms | total: ${retrieveMs + synthMs}ms`)

      // Stage: result
      sendEvent('result', JSON.stringify(result))
      res.end()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[lense] error:', message)
      sendEvent('error', JSON.stringify({ error: 'Failed to process intent.' }))
      res.end()
    }
  })

  app.post('/api/reindex', async (_req, res) => {
    try {
      const result = await deps.buildIndex()
      res.json({ status: 'ok', records: result.records })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[reindex] error:', message)
      res.status(500).json({ error: 'Reindex failed.' })
    }
  })

  return app
}
