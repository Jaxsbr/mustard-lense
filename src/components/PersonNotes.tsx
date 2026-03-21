import type { PersonNotesComponent } from '../shared/schema.js'
import './components.css'

export function PersonNotes({ data }: { data: PersonNotesComponent['data'] }) {
  return (
    <div className="lense-card">
      <h3 className="lense-card-title">People Notes</h3>
      <div className="lense-notes">
        {data.notes.map((note, i) => (
          <div key={i} className="lense-note-entry">
            <div className="lense-note-header">
              <span className="lense-person">{note.person}</span>
              <span className="lense-date">{note.capture_date_local}</span>
            </div>
            <p className="lense-text">{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
