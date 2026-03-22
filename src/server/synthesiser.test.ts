import { describe, it, expect, vi } from 'vitest'
import type { RetrievedRecord } from './rag/retriever.js'

vi.mock('../lib/claude-cli.js', () => ({
  invokeClaude: vi.fn(),
}))

import { CliSynthesiser, buildSynthesisPrompt } from './synthesiser.js'
import { invokeClaude } from '../lib/claude-cli.js'

const mockInvokeClaude = vi.mocked(invokeClaude)

const sampleRecords: RetrievedRecord[] = [
  {
    id: 'rec-1',
    log_type: 'todo',
    capture_date_local: '2026-03-15',
    text: 'Buy groceries',
    person: null,
    status: 'open',
    due_date_local: '2026-03-16',
    category: null,
    theme: null,
    period: null,
    tags: 'personal, errands',
  },
]

describe('buildSynthesisPrompt', () => {
  it('wraps intent in <user-intent> delimiters', () => {
    const prompt = buildSynthesisPrompt('what are my todos', sampleRecords)
    expect(prompt).toContain('<user-intent>what are my todos</user-intent>')
  })

  it('wraps records in <record> delimiters', () => {
    const prompt = buildSynthesisPrompt('test', sampleRecords)
    expect(prompt).toContain('<record id="rec-1"')
    expect(prompt).toContain('Buy groceries')
    expect(prompt).toContain('</record>')
  })

  it('does not reference data store path or file-reading instructions', () => {
    const prompt = buildSynthesisPrompt('test', sampleRecords)
    expect(prompt).not.toContain('~/dev/mustard/data')
    expect(prompt).not.toContain('Read the relevant YAML')
    expect(prompt).not.toContain('allowedTools')
    expect(prompt).not.toContain('addDirs')
  })
})

describe('CliSynthesiser', () => {
  const synthesiser = new CliSynthesiser()

  it('returns LenseResponse on success', async () => {
    const response = {
      components: [{ type: 'todo-list', data: { items: [{ id: '1', text: 'Buy groceries', status: 'open' }] } }],
    }

    mockInvokeClaude.mockResolvedValueOnce({
      stdout: JSON.stringify(response),
      stderr: '',
      exitCode: 0,
    })

    const result = await synthesiser.synthesise('what are my todos', sampleRecords)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].type).toBe('todo-list')
  })

  it('handles markdown-fenced JSON response', async () => {
    const response = {
      components: [{ type: 'summary', data: { title: 'Summary', text: 'Some text' } }],
    }

    mockInvokeClaude.mockResolvedValueOnce({
      stdout: '```json\n' + JSON.stringify(response) + '\n```',
      stderr: '',
      exitCode: 0,
    })

    const result = await synthesiser.synthesise('summarise', sampleRecords)
    expect(result.components).toHaveLength(1)
    expect(result.components[0].type).toBe('summary')
  })

  it('throws generic error on non-zero exit code without leaking raw output', async () => {
    mockInvokeClaude.mockResolvedValueOnce({
      stdout: '',
      stderr: 'Internal error details that should not leak',
      exitCode: 1,
    })

    await expect(synthesiser.synthesise('test', sampleRecords)).rejects.toThrow('Synthesis failed.')
  })

  it('throws generic error on empty response without leaking raw output', async () => {
    mockInvokeClaude.mockResolvedValueOnce({
      stdout: '   ',
      stderr: '',
      exitCode: 0,
    })

    await expect(synthesiser.synthesise('test', sampleRecords)).rejects.toThrow(
      'Synthesis returned an empty response.',
    )
  })

  it('throws generic error on non-JSON response without leaking raw output', async () => {
    mockInvokeClaude.mockResolvedValueOnce({
      stdout: 'I could not understand your request. Here are some suggestions...',
      stderr: '',
      exitCode: 0,
    })

    await expect(synthesiser.synthesise('test', sampleRecords)).rejects.toThrow(
      'Synthesis did not return valid JSON.',
    )
  })

  it('does not pass allowedTools or addDirs to invokeClaude', async () => {
    mockInvokeClaude.mockResolvedValueOnce({
      stdout: JSON.stringify({ components: [] }),
      stderr: '',
      exitCode: 0,
    })

    await synthesiser.synthesise('test', sampleRecords)

    const callArgs = mockInvokeClaude.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('allowedTools')
    expect(callArgs).not.toHaveProperty('addDirs')
    expect(callArgs.mode).toBe('basic')
  })
})
