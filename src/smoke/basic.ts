import { invokeClaude } from '../lib/claude-cli'

async function main() {
  console.log('=== Smoke test: basic mode ===\n')

  const result = await invokeClaude({
    mode: 'basic',
    prompt: 'What permission or restriction mode are you currently running in? Report whether you are in a restricted, standard, or unrestricted mode. Be brief.',
    onData: (chunk) => process.stdout.write(chunk),
  })

  console.log('\n\n=== Result ===')
  console.log(`Exit code: ${result.exitCode}`)
  if (result.stderr) {
    console.log(`Stderr: ${result.stderr}`)
  }
}

main().catch((err) => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
