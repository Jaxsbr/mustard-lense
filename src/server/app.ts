import express from 'express'
import { invokeClaude } from '../lib/claude-cli.js'
import { buildSystemPrompt } from './prompt.js'
import type { LenseResponse } from '../shared/schema.js'

const app = express()
app.use(express.json())

const MAX_INTENT_LENGTH = 2000

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

  try {
    const prompt = buildSystemPrompt(intent)
    const result = await invokeClaude({
      mode: 'basic',
      prompt,
      allowedTools: ['Read', 'Glob'],
      addDirs: ['~/dev/mustard/data'],
    })

    if (result.exitCode !== 0) {
      console.error('Claude invocation failed:', result.stderr)
      res.status(500).json({ error: 'Claude invocation failed.' })
      return
    }

    const raw = result.stdout.trim()
    if (!raw) {
      console.error('Claude returned empty response. stderr:', result.stderr)
      res.status(500).json({ error: 'Claude returned an empty response.' })
      return
    }

    // Extract JSON from Claude's response — it may contain markdown fences
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw

    let parsed: LenseResponse
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      console.error('Claude returned non-JSON response:', raw.slice(0, 500))
      res.status(500).json({ error: 'Claude did not return valid JSON.', detail: raw.slice(0, 300) })
      return
    }

    if (!parsed.components || !Array.isArray(parsed.components)) {
      console.error('Invalid response shape from Claude:', jsonStr.slice(0, 200))
      res.status(500).json({ error: 'Unexpected response format.' })
      return
    }

    res.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: 'Failed to process intent.', detail: message })
  }
})

export { app }
