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
