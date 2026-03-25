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

const fixtureRecords = [
  { id: 'todo-1', log_type: 'todo', capture_date_local: '2026-03-15', text: 'Buy groceries', person: null, status: 'open', due_date_local: '2026-03-16', category: null, theme: null, period: null, tags: ['personal'] },
  { id: 'todo-2', log_type: 'todo', capture_date_local: '2026-03-14', text: 'Review PR', person: null, status: 'done', due_date_local: '2026-03-14', category: null, theme: null, period: null, tags: ['work'] },
  { id: 'note-1', log_type: 'people_note', capture_date_local: '2026-03-14', text: 'Alice working on design system', person: 'alice', status: null, due_date_local: null, category: null, theme: null, period: null, tags: ['design'] },
  { id: 'log-1', log_type: 'daily_log', capture_date_local: '2026-03-15', text: 'Productive day', person: null, status: null, due_date_local: null, category: null, theme: 'engineering', period: null, tags: ['dev'] },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockRetrieve: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockSynthesise: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockBuildIndex: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockReadRecords: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockCreateRecord: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockUpdateRecord: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockDeleteRecord: any
let deps: AppDependencies

beforeEach(() => {
  mockRetrieve = vi.fn().mockResolvedValue([
    { id: 'r1', log_type: 'todo', capture_date_local: '2026-03-15', text: 'test', person: null, status: 'open', due_date_local: null, category: null, theme: null, period: null, tags: '' },
  ])
  mockSynthesise = vi.fn().mockResolvedValue(mockResponse)
  mockBuildIndex = vi.fn().mockResolvedValue({ records: 10 })
  mockReadRecords = vi.fn().mockReturnValue(fixtureRecords)
  mockCreateRecord = vi.fn().mockReturnValue({
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    log_type: 'todo',
    capture_date_local: '2026-03-22',
    text: 'Buy milk',
    person: null,
    status: null,
    due_date_local: null,
    category: null,
    theme: null,
    period: null,
    tags: [],
  })
  mockUpdateRecord = vi.fn().mockReturnValue({
    id: 'todo-1',
    log_type: 'todo',
    capture_date_local: '2026-03-15',
    text: 'Buy groceries updated',
    person: null,
    status: 'done',
    due_date_local: '2026-03-16',
    category: null,
    theme: null,
    period: null,
    tags: ['personal'],
  })
  mockDeleteRecord = vi.fn().mockReturnValue('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
  deps = { retrieve: mockRetrieve, multiRetrieve: mockRetrieve, synthesiser: { synthesise: mockSynthesise }, buildIndex: mockBuildIndex, readRecords: mockReadRecords, createRecord: mockCreateRecord, updateRecord: mockUpdateRecord, deleteRecord: mockDeleteRecord }
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

describe('GET /api/records', () => {
  it('returns all records as JSON array', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .get('/api/records')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(4)
  })

  it('filters records by type query parameter', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .get('/api/records?type=todo')
      .expect(200)

    expect(res.body).toHaveLength(2)
    expect(res.body.every((r: { log_type: string }) => r.log_type === 'todo')).toBe(true)
  })

  it('returns empty array for nonexistent type', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .get('/api/records?type=nonexistent_type')
      .expect(200)

    expect(res.body).toEqual([])
  })

  it('returns records with all expected fields', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .get('/api/records')
      .expect(200)

    const record = res.body[0]
    expect(record).toHaveProperty('id')
    expect(record).toHaveProperty('log_type')
    expect(record).toHaveProperty('capture_date_local')
    expect(record).toHaveProperty('text')
    expect(record).toHaveProperty('person')
    expect(record).toHaveProperty('status')
    expect(record).toHaveProperty('due_date_local')
    expect(record).toHaveProperty('category')
    expect(record).toHaveProperty('theme')
    expect(record).toHaveProperty('period')
    expect(record).toHaveProperty('tags')
  })

  it('returns 500 with structured error when reader throws', async () => {
    mockReadRecords.mockImplementation(() => { throw new Error('ENOENT: disk error') })
    const app = createApp(deps)
    const res = await request(app)
      .get('/api/records')
      .expect(500)
      .expect('Content-Type', /json/)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).not.toContain('ENOENT')
  })
})

describe('POST /api/records', () => {
  it('returns 201 with created record on valid input', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/records')
      .send({ log_type: 'todo', text: 'Buy milk' })
      .expect(201)
      .expect('Content-Type', /json/)

    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('log_type', 'todo')
    expect(res.body).toHaveProperty('text', 'Buy milk')
    expect(res.body).toHaveProperty('capture_date_local')
    expect(res.body).toHaveProperty('tags')
    expect(mockCreateRecord).toHaveBeenCalledWith(expect.objectContaining({ log_type: 'todo', text: 'Buy milk' }))
  })

  it('returns 400 when log_type is missing', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/records')
      .send({ text: 'Buy milk' })
      .expect(400)
      .expect('Content-Type', /json/)

    expect(res.body.error).toMatch(/log_type/i)
  })

  it('returns 400 when text is missing', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/records')
      .send({ log_type: 'todo' })
      .expect(400)
      .expect('Content-Type', /json/)

    expect(res.body.error).toMatch(/text/i)
  })

  it('returns 400 when text is empty string', async () => {
    const app = createApp(deps)
    await request(app)
      .post('/api/records')
      .send({ log_type: 'todo', text: '' })
      .expect(400)
  })

  it('returns 400 when log_type is invalid', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/records')
      .send({ log_type: 'invalid_type', text: 'test' })
      .expect(400)

    expect(res.body.error).toMatch(/log_type/i)
  })

  it('returns 500 with structured error when writer throws', async () => {
    mockCreateRecord.mockImplementation(() => { throw new Error('ENOSPC: disk full') })
    const app = createApp(deps)
    const res = await request(app)
      .post('/api/records')
      .send({ log_type: 'todo', text: 'test' })
      .expect(500)
      .expect('Content-Type', /json/)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).not.toContain('ENOSPC')
  })

  it('triggers background reindex after successful create', async () => {
    const app = createApp(deps)
    await request(app)
      .post('/api/records')
      .send({ log_type: 'todo', text: 'test' })
      .expect(201)

    // Allow background promise to settle
    await new Promise((r) => setTimeout(r, 10))
    expect(mockBuildIndex).toHaveBeenCalled()
  })

  it('passes optional fields to createRecord', async () => {
    const app = createApp(deps)
    await request(app)
      .post('/api/records')
      .send({ log_type: 'todo', text: 'test', status: 'open', due_date_local: '2026-04-01' })
      .expect(201)

    expect(mockCreateRecord).toHaveBeenCalledWith(expect.objectContaining({ status: 'open', due_date_local: '2026-04-01' }))
  })
})

describe('PUT /api/records/:id', () => {
  it('returns 200 with updated record', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .put('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .send({ text: 'Buy groceries updated', status: 'done' })
      .expect(200)
      .expect('Content-Type', /json/)

    expect(res.body).toHaveProperty('id')
    expect(mockUpdateRecord).toHaveBeenCalledWith('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', expect.objectContaining({ text: 'Buy groceries updated', status: 'done' }))
  })

  it('returns 404 when record not found', async () => {
    mockUpdateRecord.mockReturnValueOnce(null)
    const app = createApp(deps)
    const res = await request(app)
      .put('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .send({ text: 'updated' })
      .expect(404)

    expect(res.body.error).toMatch(/not found/i)
  })

  it('returns 400 for invalid ID format', async () => {
    const app = createApp(deps)
    await request(app)
      .put('/api/records/not-a-valid-uuid')
      .send({ text: 'hacked' })
      .expect(400)
  })

  it('returns 400 when text is empty', async () => {
    const app = createApp(deps)
    await request(app)
      .put('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .send({ text: '' })
      .expect(400)
  })

  it('returns 500 with structured error when writer throws', async () => {
    mockUpdateRecord.mockImplementation(() => { throw new Error('ENOSPC: disk full') })
    const app = createApp(deps)
    const res = await request(app)
      .put('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .send({ text: 'test' })
      .expect(500)
      .expect('Content-Type', /json/)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).not.toContain('ENOSPC')
  })

  it('triggers background reindex after successful update', async () => {
    const app = createApp(deps)
    await request(app)
      .put('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .send({ text: 'updated' })
      .expect(200)

    await new Promise((r) => setTimeout(r, 10))
    expect(mockBuildIndex).toHaveBeenCalled()
  })
})

describe('DELETE /api/records/:id', () => {
  it('returns 200 with deleted record ID', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .delete('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(res.body).toEqual({ id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })
    expect(mockDeleteRecord).toHaveBeenCalledWith('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
  })

  it('returns 404 when record not found', async () => {
    mockDeleteRecord.mockReturnValueOnce(null)
    const app = createApp(deps)
    const res = await request(app)
      .delete('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .expect(404)

    expect(res.body.error).toMatch(/not found/i)
  })

  it('returns 400 for invalid ID format', async () => {
    const app = createApp(deps)
    await request(app)
      .delete('/api/records/not-a-valid-uuid')
      .expect(400)
  })

  it('returns 500 with structured error when delete throws', async () => {
    mockDeleteRecord.mockImplementation(() => { throw new Error('EPERM: operation not permitted') })
    const app = createApp(deps)
    const res = await request(app)
      .delete('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .expect(500)
      .expect('Content-Type', /json/)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).not.toContain('EPERM')
  })

  it('triggers background reindex after successful delete', async () => {
    const app = createApp(deps)
    await request(app)
      .delete('/api/records/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
      .expect(200)

    await new Promise((r) => setTimeout(r, 10))
    expect(mockBuildIndex).toHaveBeenCalled()
  })

  it('returns 400 JSON when no ID is provided', async () => {
    const app = createApp(deps)
    const res = await request(app)
      .delete('/api/records')
      .expect(400)
      .expect('Content-Type', /json/)

    expect(res.body.error).toMatch(/id.*required/i)
  })
})
