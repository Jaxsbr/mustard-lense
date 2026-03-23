import { useEffect, useRef, useState } from 'react'
import type { MustardRecord } from '../../shared/record.js'
import './DetailDrawer.css'

interface DetailDrawerProps {
  record: MustardRecord | null
  mode: 'edit' | 'create'
  defaultLogType?: string
  open: boolean
  onClose: () => void
  onSave: (data: Partial<MustardRecord> & { log_type: string }) => void
  onDelete?: (id: string) => void
}

const STATUS_OPTIONS = ['open', 'done', 'parked']
const LOG_TYPE_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'people_note', label: 'People Note' },
  { value: 'idea', label: 'Idea' },
  { value: 'daily_log', label: 'Daily Log' },
]

export function DetailDrawer({ record, mode, defaultLogType, open, onClose, onSave, onDelete }: DetailDrawerProps) {
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  if (!open) return null

  // Key forces remount when record/mode changes, resetting all form state
  const formKey = mode === 'edit' ? `edit-${record?.id}` : `create-${defaultLogType}`

  return (
    <div className="drawer-backdrop" data-testid="drawer-backdrop" onClick={handleBackdropClick}>
      <div className="detail-drawer detail-drawer--open" data-testid="detail-drawer">
        <DrawerForm
          key={formKey}
          record={record}
          mode={mode}
          defaultLogType={defaultLogType}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

interface DrawerFormProps {
  record: MustardRecord | null
  mode: 'edit' | 'create'
  defaultLogType?: string
  onClose: () => void
  onSave: (data: Partial<MustardRecord> & { log_type: string }) => void
  onDelete?: (id: string) => void
}

function DrawerForm({ record, mode, defaultLogType, onClose, onSave, onDelete }: DrawerFormProps) {
  const initLogType = mode === 'edit' && record ? record.log_type : (defaultLogType ?? 'todo')
  const [logType, setLogType] = useState(initLogType)
  const [text, setText] = useState(mode === 'edit' && record ? record.text : '')
  const [status, setStatus] = useState(mode === 'edit' && record ? (record.status ?? 'open') : 'open')
  const [dueDate, setDueDate] = useState(mode === 'edit' && record ? (record.due_date_local ?? '') : '')
  const [person, setPerson] = useState(mode === 'edit' && record ? (record.person ?? '') : '')
  const [theme, setTheme] = useState(mode === 'edit' && record ? (record.theme ?? '') : '')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mode === 'create' && textRef.current) {
      textRef.current.focus()
    }
  }, [mode])

  function handleSave() {
    const data: Partial<MustardRecord> & { log_type: string } = {
      log_type: logType,
      text,
    }
    if (logType === 'todo' || logType === 'idea') data.status = status
    if (logType === 'todo') data.due_date_local = dueDate || null
    if (logType === 'people_note') data.person = person
    if (logType === 'daily_log') data.theme = theme || null
    if (mode === 'edit' && record) data.id = record.id
    onSave(data)
  }

  const isTextEmpty = text.trim().length === 0

  return (
    <>
      <div className="drawer-header">
        <h3 className="drawer-title">{mode === 'create' ? 'New Record' : 'Edit Record'}</h3>
        <button className="drawer-close" onClick={onClose} data-testid="drawer-close" aria-label="Close drawer">✕</button>
      </div>
      <div className="drawer-body">
        {mode === 'edit' && record && (
          <>
            <div className="drawer-field">
              <label className="drawer-label">ID</label>
              <input className="drawer-input" value={record.id} readOnly disabled data-testid="drawer-field-id" />
            </div>
            <div className="drawer-field">
              <label className="drawer-label">Type</label>
              <input className="drawer-input" value={record.log_type} readOnly disabled data-testid="drawer-field-log-type" />
            </div>
          </>
        )}
        {mode === 'create' && (
          <div className="drawer-field">
            <label className="drawer-label">Type</label>
            <select
              className="drawer-select"
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              data-testid="drawer-field-log-type-select"
            >
              {LOG_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="drawer-field drawer-field--text">
          <label className="drawer-label">Text</label>
          <textarea
            ref={textRef}
            className="drawer-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-testid="drawer-field-text"
          />
        </div>

        {(logType === 'todo' || logType === 'idea') && (
          <div className="drawer-field">
            <label className="drawer-label">Status</label>
            <select
              className="drawer-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              data-testid="drawer-field-status"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {logType === 'todo' && (
          <div className="drawer-field">
            <label className="drawer-label">Due Date</label>
            <input
              className="drawer-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              data-testid="drawer-field-due-date"
            />
          </div>
        )}

        {logType === 'people_note' && (
          <div className="drawer-field">
            <label className="drawer-label">Person</label>
            <input
              className="drawer-input"
              type="text"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              data-testid="drawer-field-person"
            />
          </div>
        )}

        {logType === 'daily_log' && (
          <div className="drawer-field">
            <label className="drawer-label">Theme</label>
            <input
              className="drawer-input"
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              data-testid="drawer-field-theme"
            />
          </div>
        )}
      </div>
      <div className="drawer-footer">
        {mode === 'edit' && record && onDelete && (
          confirmingDelete ? (
            <div className="drawer-delete-confirm" data-testid="drawer-delete-confirm">
              <span className="drawer-delete-confirm-text">Delete this record?</span>
              <button
                className="drawer-delete-yes"
                onClick={() => onDelete(record.id)}
                data-testid="drawer-delete-yes"
              >
                Yes, delete
              </button>
              <button
                className="drawer-delete-no"
                onClick={() => setConfirmingDelete(false)}
                data-testid="drawer-delete-no"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="drawer-delete"
              onClick={() => setConfirmingDelete(true)}
              data-testid="drawer-delete"
            >
              Delete
            </button>
          )
        )}
        <button
          className="drawer-save"
          onClick={handleSave}
          disabled={isTextEmpty}
          data-testid="drawer-save"
        >
          Save
        </button>
      </div>
    </>
  )
}
