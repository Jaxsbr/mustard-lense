import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp, type AppDependencies } from './app.js'
import type { LenseResponse } from '../shared/schema.js'

function parseSSE(body: string): Array<{ event: string; data: string }> {
  const events: Array<{ event: string; data: string }> = []
  const parts = body.split('\n\n').filter(Boolean)
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

const mockResponse: LenseResponse = {
  components: [{ type: 'summary', data: { title: 'Overview', text: 'All clear.' } }],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockRetrieve: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSynthesise: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockBuildIndex: any
let deps: AppDependencies

beforeEach(() => {
  mockRetrieve = vi.fn().mockResolvedValue([
    { id: 'r1', log_type: 'todo', capture_date_local: '2026-03-15', text: 'test', person: null, status: 'open', due_date_local: null, category: null, theme: null, period: null, tags: '' },
  ])
  mockSynthesise = vi.fn().mockResolvedValue(mockResponse)
  mockBuildIndex = vi.fn().mockResolvedValue({ records: 10 })
  deps = { retrieve: mockRetrieve, synthesiser: { synthesise: mockSynthesise }, buildIndex: mockBuildIndex }
})

describe('POST /api/lense', () => {
  it('returns SSE stream with retrieving → thinking → result events', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'open todos' })
      .expect(200)
      .expect('Content-Type', /text\/event-stream/)

    const events = parseSSE(res.text)
    expect(events.map((e) => e.event)).toEqual(['retrieving', 'thinking', 'result'])
  })

  it('result event contains valid components JSON', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'open todos' })
      .expect(200)

    const events = parseSSE(res.text)
    const resultEvent = events.find((e) => e.event === 'result')
    expect(resultEvent).toBeDefined()
    const parsed = JSON.parse(resultEvent!.data)
    expect(parsed).toHaveProperty('components')
    expect(Array.isArray(parsed.components)).toBe(true)
  })

  it('emits error event on retrieval failure', async () => {
    mockRetrieve.mockRejectedValueOnce(new Error('retrieval failed'))
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })
      .expect(200)

    const events = parseSSE(res.text)
    const errorEvent = events.find((e) => e.event === 'error')
    expect(errorEvent).toBeDefined()
    const parsed = JSON.parse(errorEvent!.data)
    expect(parsed.error).toBe('Failed to process intent.')
    // Must not leak raw error message
    expect(errorEvent!.data).not.toContain('retrieval failed')
  })

  it('emits error event on synthesis failure', async () => {
    mockSynthesise.mockRejectedValueOnce(new Error('synthesis error details'))
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })
      .expect(200)

    const events = parseSSE(res.text)
    const errorEvent = events.find((e) => e.event === 'error')
    expect(errorEvent).toBeDefined()
    const parsed = JSON.parse(errorEvent!.data)
    expect(parsed.error).toBe('Failed to process intent.')
    expect(errorEvent!.data).not.toContain('synthesis error details')
  })

  it('returns 400 JSON when intent is missing (before opening stream)', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/lense')
      .send({})
      .expect(400)
      .expect('Content-Type', /json/)

    expect(res.body.error).toMatch(/missing|empty/i)
  })

  it('returns 400 when intent is empty string', async () => {
    const app = createApp(deps)
    await request(app)
      .post('/api/lense')
      .send({ intent: '' })
      .expect(400)
  })

  it('returns 400 when intent is whitespace only', async () => {
    const app = createApp(deps)
    await request(app)
      .post('/api/lense')
      .send({ intent: '   ' })
      .expect(400)
  })

  it('returns 400 when intent exceeds max length', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'a'.repeat(2001) })
      .expect(400)

    expect(res.body.error).toMatch(/length/i)
  })

  it('returns 400 when intent is not a string', async () => {
    const app = createApp(deps)
    await request(app)
      .post('/api/lense')
      .send({ intent: 123 })
      .expect(400)
  })

  it('logs diagnostic timing for retrieval and synthesis', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const app = createApp(deps)

    await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })
      .expect(200)

    const retrievalLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('[lense] retrieval:'),
    )
    const synthesisLog = logSpy.mock.calls.find(
      (call) => typeof call[0] === 'string' && call[0].includes('[lense] synthesis:'),
    )
    expect(retrievalLog).toBeDefined()
    expect(synthesisLog).toBeDefined()

    logSpy.mockRestore()
  })
})

describe('POST /api/reindex', () => {
  it('returns 200 with record count on success', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/reindex')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(res.body).toEqual({ status: 'ok', records: 10 })
  })

  it('returns 500 with structured error on failure', async () => {
    mockBuildIndex.mockRejectedValueOnce(new Error('LanceDB internal: disk full at /tmp/lancedb'))
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/reindex')
      .expect(500)
      .expect('Content-Type', /json/)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).not.toContain('LanceDB')
    expect(res.body.error).not.toContain('disk full')
  })
})
