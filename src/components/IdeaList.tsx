import type { IdeaListComponent } from '../shared/schema.js'
import './components.css'

const statusColors: Record<string, string> = {
  open: 'var(--lense-color-status-open)',
  done: 'var(--lense-color-status-done)',
  parked: 'var(--lense-color-status-parked)',
}

export function IdeaList({ data }: { data: IdeaListComponent['data'] }) {
  return (
    <div className="lense-card">
      <h3 className="lense-card-title">Ideas</h3>
      <ul className="lense-list">
        {data.items.map((item) => (
          <li key={item.id} className="lense-list-item">
            <span
              className="lense-badge"
              style={{ backgroundColor: statusColors[item.status] ?? 'var(--lense-color-text-muted)', color: '#fff' }}
            >
              {item.status}
            </span>
            <span className="lense-list-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
