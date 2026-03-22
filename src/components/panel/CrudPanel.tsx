import { useCallback, useEffect, useState } from 'react'
import './CrudPanel.css'

interface MustardRecord {
  id: string
  log_type: string
  capture_date_local: string
  text: string
  person: string | null
  status: string | null
  due_date_local: string | null
  category: string | null
  theme: string | null
  period: string | null
  tags: string[]
}

const TABS = [
  { label: 'Todos', type: 'todo' },
  { label: 'People', type: 'people_note' },
  { label: 'Ideas', type: 'idea' },
  { label: 'Daily Logs', type: 'daily_log' },
] as const

interface CrudPanelProps {
  collapsed: boolean
  onToggle: () => void
}

export function CrudPanel({ collapsed, onToggle }: CrudPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].type)
  const [records, setRecords] = useState<MustardRecord[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const fetchRecords = useCallback(async (type: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/records?type=${type}`)
      if (res.ok) {
        const data: MustardRecord[] = await res.json()
        setRecords(data)
        setCounts((prev) => ({ ...prev, [type]: data.length }))
      }
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAllCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/records')
      if (res.ok) {
        const data: MustardRecord[] = await res.json()
        const countMap: Record<string, number> = {}
        for (const tab of TABS) {
          countMap[tab.type] = data.filter((r) => r.log_type === tab.type).length
        }
        setCounts(countMap)
      }
    } catch {
      // counts remain as-is
    }
  }, [])

  useEffect(() => {
    if (!collapsed) {
      fetchRecords(activeTab)
      fetchAllCounts()
    }
  }, [collapsed, activeTab, fetchRecords, fetchAllCounts])

  function handleTabClick(type: string) {
    setActiveTab(type)
  }

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
        <>
          <div className="crud-panel-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.type}
                role="tab"
                aria-selected={activeTab === tab.type}
                className={`crud-panel-tab${activeTab === tab.type ? ' crud-panel-tab--active' : ''}`}
                onClick={() => handleTabClick(tab.type)}
                data-testid={`tab-${tab.type}`}
              >
                {tab.label}
                {counts[tab.type] != null && (
                  <span className="crud-panel-tab-count">{counts[tab.type]}</span>
                )}
              </button>
            ))}
          </div>
          <div className="crud-panel-body">
            {loading && <div className="crud-panel-loading" data-testid="panel-loading">Loading...</div>}
            {!loading && records.length === 0 && (
              <p className="crud-panel-empty" data-testid="panel-empty">No records found.</p>
            )}
            {!loading && records.length > 0 && (
              <ul className="crud-panel-list" data-testid="panel-list">
                {records.map((record) => (
                  <li key={record.id} className="crud-panel-list-item" data-testid="panel-list-item">
                    {record.text.length > 80 ? record.text.slice(0, 80) + '…' : record.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  )
}

export { TABS }
export type { MustardRecord as PanelRecord }
