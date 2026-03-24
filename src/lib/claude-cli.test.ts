import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventEmitter } from 'events'
import { invokeClaude } from './claude-cli'

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

import { spawn } from 'child_process'

const mockSpawn = vi.mocked(spawn)

function createMockProcess() {
  const proc = new EventEmitter() as EventEmitter & {
    stdout: EventEmitter
    stderr: EventEmitter
  }
  proc.stdout = new EventEmitter()
  proc.stderr = new EventEmitter()
  return proc
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('invokeClaude', () => {
  it('spawns claude without --dangerously-skip-permissions in basic mode', async () => {
    const proc = createMockProcess()
    mockSpawn.mockReturnValue(proc as never)

    const promise = invokeClaude({ mode: 'basic', prompt: 'hello' })

    proc.stdout.emit('data', Buffer.from('output'))
    proc.emit('close', 0)

    await promise

    expect(mockSpawn).toHaveBeenCalledWith('claude', ['-p', 'hello'])
    const args = mockSpawn.mock.calls[0][1] as string[]
    expect(args).not.toContain('--dangerously-skip-permissions')
  })

  it('spawns claude with --dangerously-skip-permissions in admin mode', async () => {
    const proc = createMockProcess()
    mockSpawn.mockReturnValue(proc as never)

    const promise = invokeClaude({ mode: 'admin', prompt: 'hello' })

    proc.stdout.emit('data', Buffer.from('output'))
    proc.emit('close', 0)

    await promise

    expect(mockSpawn).toHaveBeenCalledWith('claude', [
      '--dangerously-skip-permissions',
      '-p',
      'hello',
    ])
    const args = mockSpawn.mock.calls[0][1] as string[]
    expect(args).toContain('--dangerously-skip-permissions')
  })

  it('returns ClaudeResult with stdout, stderr, and exitCode', async () => {
    const proc = createMockProcess()
    mockSpawn.mockReturnValue(proc as never)

    const promise = invokeClaude({ mode: 'basic', prompt: 'test' })

    proc.stdout.emit('data', Buffer.from('hello '))
    proc.stdout.emit('data', Buffer.from('world'))
    proc.stderr.emit('data', Buffer.from('warn'))
    proc.emit('close', 0)

    const result = await promise

    expect(result).toHaveProperty('stdout', 'hello world')
    expect(result).toHaveProperty('stderr', 'warn')
    expect(result).toHaveProperty('exitCode', 0)
  })

  it('returns non-zero exit code on failure', async () => {
    const proc = createMockProcess()
    mockSpawn.mockReturnValue(proc as never)

    const promise = invokeClaude({ mode: 'basic', prompt: 'test' })

    proc.stderr.emit('data', Buffer.from('error occurred'))
    proc.emit('close', 1)

    const result = await promise

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toBe('error occurred')
  })

  it('rejects when spawn emits error (e.g. claude not found)', async () => {
    const proc = createMockProcess()
    mockSpawn.mockReturnValue(proc as never)

    const promise = invokeClaude({ mode: 'basic', prompt: 'test' })

    proc.emit('error', new Error('spawn claude ENOENT'))

    await expect(promise).rejects.toThrow('spawn claude ENOENT')
  })

  it('calls onData callback for each stdout chunk', async () => {
    const proc = createMockProcess()
    mockSpawn.mockReturnValue(proc as never)

    const chunks: string[] = []
    const promise = invokeClaude({
      mode: 'basic',
      prompt: 'test',
      onData: (chunk) => chunks.push(chunk),
    })

    proc.stdout.emit('data', Buffer.from('chunk1'))
    proc.stdout.emit('data', Buffer.from('chunk2'))
    proc.emit('close', 0)

    await promise

    expect(chunks).toEqual(['chunk1', 'chunk2'])
  })

  it('passes --allowedTools and --add-dir args when specified', async () => {
    const proc = createMockProcess()
    mockSpawn.mockReturnValue(proc as never)

    const promise = invokeClaude({
      mode: 'basic',
      prompt: 'test',
      allowedTools: ['Read', 'Glob'],
      addDirs: ['~/dev/mustard-data'],
    })

    proc.stdout.emit('data', Buffer.from('{}'))
    proc.emit('close', 0)

    await promise

    expect(mockSpawn).toHaveBeenCalledWith('claude', [
      '--allowedTools', 'Read', 'Glob',
      '--add-dir', '~/dev/mustard-data',
      '-p', 'test',
    ])
  })

  it('rejects with error for empty prompt', async () => {
    await expect(invokeClaude({ mode: 'basic', prompt: '' })).rejects.toThrow(
      'Prompt must be a non-empty string',
    )
    expect(mockSpawn).not.toHaveBeenCalled()
  })

  it('rejects with error for invalid mode', async () => {
    await expect(
      invokeClaude({ mode: 'invalid' as 'basic', prompt: 'test' }),
    ).rejects.toThrow('Invalid mode')
    expect(mockSpawn).not.toHaveBeenCalled()
  })
})
