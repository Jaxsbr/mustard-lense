import type { PanelRecord } from './CrudPanel.js'
import './ListItems.css'

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function statusIcon(status: string | null): string {
  switch (status) {
    case 'done': return '✓'
    case 'open': return '○'
    case 'parked': return '◇'
    default: return '○'
  }
}

function statusClass(status: string | null): string {
  switch (status) {
    case 'done': return 'list-status--done'
    case 'open': return 'list-status--open'
    case 'parked': return 'list-status--parked'
    default: return 'list-status--open'
  }
}

export function TodoListItem({ record }: { record: PanelRecord }) {
  return (
    <div className="list-item list-item--todo" data-testid="list-item-todo">
      <span className={`list-status ${statusClass(record.status)}`}>{statusIcon(record.status)}</span>
      <span className="list-text">{truncate(record.text)}</span>
      {record.due_date_local && <span className="list-date">{record.due_date_local}</span>}
    </div>
  )
}

export function PeopleListItem({ record }: { record: PanelRecord }) {
  return (
    <div className="list-item list-item--people" data-testid="list-item-people">
      <span className="list-person">{record.person ?? 'Unknown'}</span>
      <span className="list-text">{truncate(record.text)}</span>
      <span className="list-date">{record.capture_date_local}</span>
    </div>
  )
}

export function IdeaListItem({ record }: { record: PanelRecord }) {
  return (
    <div className="list-item list-item--idea" data-testid="list-item-idea">
      <span className={`list-status ${statusClass(record.status)}`}>{record.status ?? 'open'}</span>
      <span className="list-text">{truncate(record.text)}</span>
    </div>
  )
}

export function DailyLogListItem({ record }: { record: PanelRecord }) {
  return (
    <div className="list-item list-item--daily-log" data-testid="list-item-daily-log">
      <span className="list-date">{record.capture_date_local}</span>
      {record.theme && <span className="list-theme">{record.theme}</span>}
      <span className="list-text">{truncate(record.text)}</span>
    </div>
  )
}

export function ListItem({ record, type }: { record: PanelRecord; type: string }) {
  switch (type) {
    case 'todo': return <TodoListItem record={record} />
    case 'people_note': return <PeopleListItem record={record} />
    case 'idea': return <IdeaListItem record={record} />
    case 'daily_log': return <DailyLogListItem record={record} />
    default: return <div className="list-item"><span className="list-text">{truncate(record.text)}</span></div>
  }
}
