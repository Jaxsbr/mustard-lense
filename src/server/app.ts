import express from 'express'
import type { RetrievedRecord } from './rag/retriever.js'
import type { Synthesiser } from './synthesiser.js'
import type { IndexResult } from './rag/indexer.js'
import type { MustardRecord } from './data/reader.js'
import { validateLogType, validateText, type CreateRecordInput, type UpdateRecordInput } from './data/writer.js'

const MAX_INTENT_LENGTH = 2000

export interface AppDependencies {
  retrieve: (query: string, k?: number) => Promise<RetrievedRecord[]>
  synthesiser: Synthesiser
  buildIndex: (dataPath?: string) => Promise<IndexResult>
  readRecords: (dataDir?: string) => MustardRecord[]
  createRecord: (input: CreateRecordInput, dataDir?: string) => MustardRecord
  updateRecord: (id: string, input: UpdateRecordInput, dataDir?: string) => MustardRecord | null
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

      // Stage: thinking — include retrieval stats so the client can show them
      sendEvent('thinking', JSON.stringify({ retrieveMs, recordCount: records.length }))
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

  app.get('/api/records', (req, res) => {
    try {
      const typeFilter = typeof req.query.type === 'string' ? req.query.type : undefined
      const records = deps.readRecords()
      const filtered = typeFilter ? records.filter((r) => r.log_type === typeFilter) : records
      res.json(filtered)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[records] error:', message)
      res.status(500).json({ error: 'Failed to read records.' })
    }
  })

  app.post('/api/records', (req, res) => {
    try {
      const { log_type, text, ...optionalFields } = req.body ?? {}

      if (!validateLogType(log_type)) {
        res.status(400).json({ error: 'Missing or invalid log_type. Must be one of: todo, people_note, idea, daily_log.' })
        return
      }
      if (!validateText(text)) {
        res.status(400).json({ error: 'Missing, empty, or excessively long text field.' })
        return
      }

      const input: CreateRecordInput = { log_type, text, ...optionalFields }
      const record = deps.createRecord(input)
      res.status(201).json(record)

      // Background reindex — fire and forget
      deps.buildIndex().catch((err) => {
        console.error('[reindex] background reindex after create failed:', err instanceof Error ? err.message : err)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[records] create error:', message)
      res.status(500).json({ error: 'Failed to create record.' })
    }
  })

  app.put('/api/records/:id', (req, res) => {
    try {
      const { id } = req.params

      // Validate ID format — must be a UUID pattern (no path traversal)
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        res.status(400).json({ error: 'Invalid record ID format.' })
        return
      }

      const input: UpdateRecordInput = req.body ?? {}
      if (input.text !== undefined && !validateText(input.text)) {
        res.status(400).json({ error: 'Text field must be a non-empty string within length limits.' })
        return
      }

      const updated = deps.updateRecord(id, input)
      if (!updated) {
        res.status(404).json({ error: 'Record not found.' })
        return
      }
      res.json(updated)

      // Background reindex — fire and forget
      deps.buildIndex().catch((err) => {
        console.error('[reindex] background reindex after update failed:', err instanceof Error ? err.message : err)
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[records] update error:', message)
      res.status(500).json({ error: 'Failed to update record.' })
    }
  })

  return app
}
