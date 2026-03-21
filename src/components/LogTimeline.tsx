import type { LogTimelineComponent } from '../shared/schema.js'
import './components.css'

export function LogTimeline({ data }: { data: LogTimelineComponent['data'] }) {
  return (
    <div className="lense-card">
      <h3 className="lense-card-title">Daily Logs</h3>
      <div className="lense-timeline">
        {data.entries.map((entry, i) => (
          <div key={i} className="lense-timeline-entry">
            <div className="lense-timeline-header">
              <span className="lense-date">{entry.capture_date_local}</span>
              <span className="lense-badge">{entry.theme}</span>
            </div>
            <p className="lense-text">{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
