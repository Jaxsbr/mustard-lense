import './CrudPanel.css'

interface CrudPanelProps {
  collapsed: boolean
  onToggle: () => void
}

export function CrudPanel({ collapsed, onToggle }: CrudPanelProps) {
  return (
    <aside className={`crud-panel${collapsed ? ' crud-panel--collapsed' : ''}`} data-testid="crud-panel">
      <div className="crud-panel-header">
        <button
          className="crud-panel-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          data-testid="panel-toggle"
        >
          {collapsed ? '☰' : '✕'}
        </button>
        {!collapsed && <span className="crud-panel-title">Browse</span>}
      </div>
      {!collapsed && (
        <div className="crud-panel-body">
          <p className="crud-panel-placeholder">Select a tab to browse records.</p>
        </div>
      )}
    </aside>
  )
}
