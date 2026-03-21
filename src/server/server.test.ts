import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('../lib/claude-cli.js', () => ({
  invokeClaude: vi.fn(),
}))

import { app } from './app.js'
import { invokeClaude } from '../lib/claude-cli.js'

const mockInvokeClaude = vi.mocked(invokeClaude)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/lense', () => {
  it('returns parsed JSON for a valid intent', async () => {
    const mockResponse = {
      components: [
        { type: 'summary', data: { title: 'Overview', text: 'All clear.' } },
      ],
    }
    mockInvokeClaude.mockResolvedValue({
      stdout: JSON.stringify(mockResponse),
      stderr: '',
      exitCode: 0,
    })

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'open todos' })
      .expect(200)
      .expect('Content-Type', /json/)

    expect(res.body).toEqual(mockResponse)
    expect(mockInvokeClaude).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'basic',
        prompt: expect.stringContaining('open todos'),
        allowedTools: ['Read', 'Glob'],
        addDirs: ['~/dev/mustard/data'],
      }),
    )
  })

  it('extracts JSON from markdown-fenced response', async () => {
    const mockResponse = {
      components: [
        { type: 'summary', data: { title: 'Test', text: 'fenced' } },
      ],
    }
    mockInvokeClaude.mockResolvedValue({
      stdout: '```json\n' + JSON.stringify(mockResponse) + '\n```',
      stderr: '',
      exitCode: 0,
    })

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'test query' })
      .expect(200)

    expect(res.body).toEqual(mockResponse)
  })

  it('calls invokeClaude with mode basic', async () => {
    mockInvokeClaude.mockResolvedValue({
      stdout: '{"components":[]}',
      stderr: '',
      exitCode: 0,
    })

    await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })

    expect(mockInvokeClaude).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'basic' }),
    )
  })

  it('returns 400 when intent is missing', async () => {
    const res = await request(app)
      .post('/api/lense')
      .send({})
      .expect(400)

    expect(res.body.error).toMatch(/missing|empty/i)
  })

  it('returns 400 when intent is an empty string', async () => {
    const res = await request(app)
      .post('/api/lense')
      .send({ intent: '' })
      .expect(400)

    expect(res.body.error).toMatch(/missing|empty/i)
  })

  it('returns 400 when intent is whitespace only', async () => {
    await request(app)
      .post('/api/lense')
      .send({ intent: '   ' })
      .expect(400)
  })

  it('returns 400 when intent exceeds max length', async () => {
    const longIntent = 'a'.repeat(2001)

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: longIntent })
      .expect(400)

    expect(res.body.error).toMatch(/length/i)
  })

  it('returns 400 when intent is not a string', async () => {
    await request(app)
      .post('/api/lense')
      .send({ intent: 123 })
      .expect(400)
  })

  it('returns 500 with structured error when invokeClaude fails', async () => {
    mockInvokeClaude.mockRejectedValue(new Error('spawn failed'))

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })
      .expect(500)

    expect(res.body).toHaveProperty('error')
    expect(res.body).toHaveProperty('detail')
    expect(res.body.error).not.toContain('stack')
  })

  it('returns 500 when Claude exits with non-zero code', async () => {
    mockInvokeClaude.mockResolvedValue({
      stdout: '',
      stderr: 'something went wrong',
      exitCode: 1,
    })

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })
      .expect(500)

    expect(res.body).toHaveProperty('error')
  })

  it('returns 500 when Claude returns invalid JSON', async () => {
    mockInvokeClaude.mockResolvedValue({
      stdout: 'not valid json at all',
      stderr: '',
      exitCode: 0,
    })

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })
      .expect(500)

    expect(res.body.error).toBe('Claude did not return valid JSON.')
    expect(res.body.detail).toBeUndefined()
  })

  it('returns 500 without leaking raw response when Claude needs permissions', async () => {
    mockInvokeClaude.mockResolvedValue({
      stdout: 'I need permission to access the filesystem to read those files.',
      stderr: '',
      exitCode: 0,
    })

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'show my todos' })
      .expect(500)

    expect(res.body.error).toBe('Claude did not return valid JSON.')
    expect(res.body.detail).toBeUndefined()
  })

  it('returns 500 when Claude returns empty response', async () => {
    mockInvokeClaude.mockResolvedValue({
      stdout: '',
      stderr: '',
      exitCode: 0,
    })

    const res = await request(app)
      .post('/api/lense')
      .send({ intent: 'test' })
      .expect(500)

    expect(res.body.error).toBe('Claude returned an empty response.')
  })
})
