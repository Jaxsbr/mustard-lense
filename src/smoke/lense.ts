// On-demand smoke test — lense E2E
// Requires: API server running on port 3001 (npm run dev:server)
// Requires: real claude CLI and mustard data store at ~/dev/mustard/data/

const API_URL = 'http://localhost:3001/api/lense'
const INTENT = "what's going on this week"

async function main() {
  console.log(`Sending intent: "${INTENT}"`)
  console.log(`To: ${API_URL}\n`)

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent: INTENT }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`HTTP ${res.status}: ${body}`)
    process.exit(1)
  }

  const data = await res.json()

  // Assert components array exists
  if (!data.components || !Array.isArray(data.components)) {
    console.error('Response missing components array:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  if (data.components.length === 0) {
    console.error('Response has empty components array')
    process.exit(1)
  }

  // Print component types
  const types = data.components.map((c: { type: string }) => c.type)
  console.log(`Components returned: ${data.components.length}`)
  console.log(`Types: ${types.join(', ')}`)
  console.log('\nSmoke test passed.')
}

main().catch((err) => {
  console.error('Smoke test failed:', err)
  process.exit(1)
})
