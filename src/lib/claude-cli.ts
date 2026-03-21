import { spawn } from 'child_process'

export type ClaudeMode = 'basic' | 'admin'

export interface ClaudeResult {
  stdout: string
  stderr: string
  exitCode: number
}

export interface InvokeClaudeOptions {
  mode: ClaudeMode
  prompt: string
  allowedTools?: string[]
  addDirs?: string[]
  onData?: (chunk: string) => void
}

export function invokeClaude(options: InvokeClaudeOptions): Promise<ClaudeResult> {
  const { mode, prompt, allowedTools, addDirs, onData } = options

  if (mode !== 'basic' && mode !== 'admin') {
    return Promise.reject(new Error(`Invalid mode: ${mode as string}. Must be 'basic' or 'admin'.`))
  }

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    return Promise.reject(new Error('Prompt must be a non-empty string.'))
  }

  const args: string[] = []

  if (mode === 'admin') {
    args.push('--dangerously-skip-permissions')
  }

  if (allowedTools?.length) {
    args.push('--allowedTools', ...allowedTools)
  }

  if (addDirs?.length) {
    for (const dir of addDirs) {
      args.push('--add-dir', dir)
    }
  }

  args.push('-p', prompt)

  return new Promise<ClaudeResult>((resolve, reject) => {
    const child = spawn('claude', args)

    let stdout = ''
    let stderr = ''
    let settled = false

    child.stdout.on('data', (data: Buffer) => {
      const chunk = data.toString()
      stdout += chunk
      onData?.(chunk)
    })

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    child.on('close', (code: number | null) => {
      if (settled) return
      settled = true
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
      })
    })

    child.on('error', (err: Error) => {
      if (settled) return
      settled = true
      reject(err)
    })
  })
}
