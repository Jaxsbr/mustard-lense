// Response schema — shared between API server and frontend renderers.
// Each component type has a `type` discriminator and a typed `data` object.

export interface TodoItem {
  id: string
  text: string
  status: string
  due_date_local?: string
}

export interface TodoListComponent {
  type: 'todo-list'
  data: {
    items: TodoItem[]
  }
}

export interface LogEntry {
  capture_date_local: string
  theme: string
  text: string
}

export interface LogTimelineComponent {
  type: 'log-timeline'
  data: {
    entries: LogEntry[]
  }
}

export interface PersonNote {
  person: string
  capture_date_local: string
  text: string
}

export interface PersonNotesComponent {
  type: 'person-notes'
  data: {
    notes: PersonNote[]
  }
}

export interface IdeaItem {
  id: string
  text: string
  status: string
}

export interface IdeaListComponent {
  type: 'idea-list'
  data: {
    items: IdeaItem[]
  }
}

export interface SummaryComponent {
  type: 'summary'
  data: {
    title: string
    text: string
  }
}

export type LenseComponent =
  | TodoListComponent
  | LogTimelineComponent
  | PersonNotesComponent
  | IdeaListComponent
  | SummaryComponent

export interface LenseResponse {
  components: LenseComponent[]
}

/**
 * Validates that a component's data matches the expected shape for its type.
 * Returns true if the data is structurally valid, false otherwise.
 */
export function isValidComponentData(component: { type: string; data: unknown }): boolean {
  const d = component.data
  if (d == null || typeof d !== 'object') return false

  switch (component.type) {
    case 'todo-list':
      return 'items' in d && Array.isArray((d as Record<string, unknown>).items)
    case 'log-timeline':
      return 'entries' in d && Array.isArray((d as Record<string, unknown>).entries)
    case 'person-notes':
      return 'notes' in d && Array.isArray((d as Record<string, unknown>).notes)
    case 'idea-list':
      return 'items' in d && Array.isArray((d as Record<string, unknown>).items)
    case 'summary':
      return typeof (d as Record<string, unknown>).title === 'string' &&
        typeof (d as Record<string, unknown>).text === 'string'
    default:
      return false
  }
}
