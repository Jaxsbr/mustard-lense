import { invokeClaude } from '../lib/claude-cli'

async function main() {
  console.log('=== Smoke test: basic mode ===\n')

  const result = await invokeClaude({
    mode: 'basic',
    prompt: 'Respond with exactly: SMOKE_OK_BASIC',
    onData: (chunk) => process.stdout.write(chunk),
  })

  console.log('\n\n=== Result ===')
  console.log(`Exit code: ${result.exitCode}`)
  if (result.stderr) {
    console.log(`Stderr: ${result.stderr}`)
  }

  if (result.exitCode !== 0) {
    console.error('FAIL: non-zero exit code')
    process.exit(1)
  }
  if (!result.stdout || result.stdout.trim().length === 0) {
    console.error('FAIL: empty stdout — CLI returned no output')
    process.exit(1)
  }

  console.log('PASS: basic mode integration confirmed')
}

main().catch((err) => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
