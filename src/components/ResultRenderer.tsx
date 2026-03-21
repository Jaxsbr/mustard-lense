import type { LenseComponent } from '../shared/schema.js'
import { TodoList } from './TodoList.js'
import { LogTimeline } from './LogTimeline.js'
import { PersonNotes } from './PersonNotes.js'
import { IdeaList } from './IdeaList.js'
import { Summary } from './Summary.js'
import { FallbackComponent } from './FallbackComponent.js'

export function ResultRenderer({ component }: { component: LenseComponent }) {
  switch (component.type) {
    case 'todo-list':
      return <TodoList data={component.data} />
    case 'log-timeline':
      return <LogTimeline data={component.data} />
    case 'person-notes':
      return <PersonNotes data={component.data} />
    case 'idea-list':
      return <IdeaList data={component.data} />
    case 'summary':
      return <Summary data={component.data} />
    default:
      return <FallbackComponent type={(component as { type: string }).type} />
  }
}
