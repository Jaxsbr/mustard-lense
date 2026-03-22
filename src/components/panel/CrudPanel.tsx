import { useCallback, useEffect, useRef, useState } from 'react'
import type { MustardRecord } from '../../shared/record.js'
import { TABS } from './types.js'
import { ListItem } from './ListItems.js'
import './CrudPanel.css'

interface CrudPanelProps {
  collapsed: boolean
  onToggle: () => void
}

export function CrudPanel({ collapsed, onToggle }: CrudPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].type)
  const [records, setRecords] = useState<MustardRecord[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [countsLoaded, setCountsLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const fetchRecords = useCallback(async (type: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const res = await fetch(`/api/records?type=${type}`, { signal: controller.signal })
      if (res.ok) {
        const data: MustardRecord[] = await res.json()
        setRecords(data)
        setCounts((prev) => ({ ...prev, [type]: data.length }))
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setRecords([])
    } finally {
      if (!controller.signal.aborted) setLoading(false)
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
        setCountsLoaded(true)
      }
    } catch {
      // counts remain as-is
    }
  }, [])

  useEffect(() => {
    if (!collapsed) {
      fetchRecords(activeTab)
    }
  }, [collapsed, activeTab, fetchRecords])

  useEffect(() => {
    if (!collapsed && !countsLoaded) {
      fetchAllCounts()
    }
  }, [collapsed, countsLoaded, fetchAllCounts])

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
              <div className="crud-panel-list" data-testid="panel-list">
                {records.map((record) => (
                  <div key={record.id} data-testid="panel-list-item">
                    <ListItem record={record} type={activeTab} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  )
}
