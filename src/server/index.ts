import { createApp } from './app.js'
import { retrieve } from './rag/retriever.js'
import { buildIndex } from './rag/indexer.js'
import { CliSynthesiser } from './synthesiser.js'

const PORT = parseInt(process.env.PORT ?? '3001', 10)

async function start() {
  console.log('[server] Building vector index...')
  const indexResult = await buildIndex()
  console.log(`[server] Index built: ${indexResult.records} records`)

  const app = createApp({
    retrieve,
    synthesiser: new CliSynthesiser(),
    buildIndex,
  })

  app.listen(PORT, () => {
    console.log(`Lense API server listening on port ${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
