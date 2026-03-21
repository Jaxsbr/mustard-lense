import type { TodoListComponent } from '../shared/schema.js'
import './components.css'

const statusColors: Record<string, string> = {
  open: 'var(--lense-color-status-open)',
  done: 'var(--lense-color-status-done)',
  parked: 'var(--lense-color-status-parked)',
}

export function TodoList({ data }: { data: TodoListComponent['data'] }) {
  return (
    <div className="lense-card">
      <h3 className="lense-card-title">Todos</h3>
      <ul className="lense-list">
        {data.items.map((item) => (
          <li key={item.id} className="lense-list-item">
            <span
              className="lense-status-dot"
              style={{ backgroundColor: statusColors[item.status] ?? 'var(--lense-color-text-muted)' }}
              title={item.status}
            />
            <span className="lense-list-text">{item.text}</span>
            {item.due_date_local && (
              <span className="lense-date">{item.due_date_local}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
