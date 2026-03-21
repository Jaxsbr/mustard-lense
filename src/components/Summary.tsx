import type { SummaryComponent } from '../shared/schema.js'
import './components.css'

export function Summary({ data }: { data: SummaryComponent['data'] }) {
  return (
    <div className="lense-card lense-card--summary">
      <h3 className="lense-card-title">{data.title}</h3>
      <p className="lense-text">{data.text}</p>
    </div>
  )
}
