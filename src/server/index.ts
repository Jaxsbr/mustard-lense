import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createApp } from './app.js'
import { retrieve } from './rag/retriever.js'
import { buildIndex } from './rag/indexer.js'
import { multiRetrieve } from './rag/scanner.js'
import { CliSynthesiser } from './synthesiser.js'
import { readRecords } from './data/reader.js'
import { createRecord, updateRecord, deleteRecord } from './data/writer.js'

const PORT = parseInt(process.env.PORT ?? '3001', 10)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, '../../dist')

let indexReady = false

const guardedRetrieve: typeof retrieve = async (query, k, filter) => {
  if (!indexReady) throw new Error('Vector index is still building. Try again shortly.')
  return retrieve(query, k, filter)
}

const guardedMultiRetrieve: typeof multiRetrieve = async (intent) => {
  if (!indexReady) throw new Error('Vector index is still building. Try again shortly.')
  return multiRetrieve(intent)
}

async function start() {
  const app = createApp({
    retrieve: guardedRetrieve,
    multiRetrieve: guardedMultiRetrieve,
    synthesiser: new CliSynthesiser(),
    buildIndex,
    readRecords,
    createRecord,
    updateRecord,
    deleteRecord,
  })

  // In production, serve Vite build static files so the full app runs on a single port
  if (process.env.NODE_ENV !== 'development') {
    app.use(express.static(distDir))
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'))
    })
  }

  app.listen(PORT, () => {
    console.log(`Lense API server listening on port ${PORT}`)
  })

  console.log('[server] Building vector index...')
  const indexResult = await buildIndex()
  indexReady = true
  console.log(`[server] Index built: ${indexResult.records} records`)
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
