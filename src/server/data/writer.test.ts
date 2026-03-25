import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { createRecord } from './writer.js'
import { readRecords } from './reader.js'

let tmpDir: string

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mustard-writer-test-'))
})

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('createRecord month-folder path', () => {
  it('writes file to YYYY/MM subdirectory', () => {
    const record = createRecord({ log_type: 'todo', text: 'Test todo' }, tmpDir)

    const today = new Date().toISOString().slice(0, 10)
    const [year, month] = today.split('-')

    // The file should be at <tmpDir>/todos/<year>/<month>/<id>.yaml
    const expectedDir = path.join(tmpDir, 'todos', year, month)
    const expectedFile = path.join(expectedDir, `${record.id}.yaml`)

    expect(fs.existsSync(expectedFile)).toBe(true)
  })

  it('creates month directory recursively', () => {
    const record = createRecord({ log_type: 'daily_log', text: 'Test log' }, tmpDir)

    const today = new Date().toISOString().slice(0, 10)
    const [year, month] = today.split('-')

    const expectedDir = path.join(tmpDir, 'daily_logs', year, month)
    expect(fs.existsSync(expectedDir)).toBe(true)
    expect(fs.existsSync(path.join(expectedDir, `${record.id}.yaml`))).toBe(true)
  })

  it('records in month folders are readable via readRecords', () => {
    createRecord({ log_type: 'idea', text: 'Test idea' }, tmpDir)

    const records = readRecords(tmpDir)
    expect(records).toHaveLength(1)
    expect(records[0].text).toBe('Test idea')
  })

  it('flat files are still readable alongside month-folder files', () => {
    // Create a flat file (old format)
    const flatDir = path.join(tmpDir, 'todos')
    fs.mkdirSync(flatDir, { recursive: true })
    fs.writeFileSync(
      path.join(flatDir, 'flat-record.yaml'),
      'id: flat-1\nlog_type: todo\ncapture_date_local: "2026-01-01"\ntext: "Old flat record"\n'
    )

    // Create a month-folder file (new format)
    createRecord({ log_type: 'todo', text: 'New month record' }, tmpDir)

    const records = readRecords(tmpDir)
    expect(records).toHaveLength(2)
    expect(records.map(r => r.text).sort()).toEqual(['New month record', 'Old flat record'])
  })
})
