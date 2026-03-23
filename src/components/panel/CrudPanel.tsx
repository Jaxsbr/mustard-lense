import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MustardRecord } from '../../shared/record.js'
import { TABS } from './types.js'
import { ListItem } from './ListItems.js'
import { DetailDrawer } from './DetailDrawer.js'
import { ListControls } from './ListControls.js'
import { sortRecords, filterByStatus, type SortOption, type StatusFilter } from './sort.js'
import './CrudPanel.css'

interface CrudPanelProps {
  collapsed: boolean
  onToggle: () => void
}

const DEFAULT_LIMIT = 25

function getStoredSort(type: string): SortOption {
  try {
    const stored = localStorage.getItem(`mustard-sort-${type}`)
    if (stored === 'newest' || stored === 'oldest') return stored
  } catch { /* localStorage unavailable */ }
  return 'newest'
}

function getStoredLimit(type: string): number {
  try {
    const stored = localStorage.getItem(`mustard-limit-${type}`)
    if (stored) {
      const n = Number(stored)
      if (n > 0) return n
    }
  } catch { /* localStorage unavailable */ }
  return DEFAULT_LIMIT
}

function getStoredFilter(type: string): StatusFilter {
  try {
    const stored = localStorage.getItem(`mustard-filter-${type}`)
    if (stored === 'all' || stored === 'open' || stored === 'done' || stored === 'parked') return stored
  } catch { /* localStorage unavailable */ }
  return 'all'
}

export function CrudPanel({ collapsed, onToggle }: CrudPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(TABS[0].type)
  const [records, setRecords] = useState<MustardRecord[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [countsLoaded, setCountsLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'edit' | 'create'>('edit')
  const [selectedRecord, setSelectedRecord] = useState<MustardRecord | null>(null)
  const [sortPrefs, setSortPrefs] = useState<Record<string, SortOption>>(() => {
    const prefs: Record<string, SortOption> = {}
    for (const tab of TABS) prefs[tab.type] = getStoredSort(tab.type)
    return prefs
  })
  const [limitPrefs, setLimitPrefs] = useState<Record<string, number>>(() => {
    const prefs: Record<string, number> = {}
    for (const tab of TABS) prefs[tab.type] = getStoredLimit(tab.type)
    return prefs
  })
  const [filterPrefs, setFilterPrefs] = useState<Record<string, StatusFilter>>(() => {
    const prefs: Record<string, StatusFilter> = {}
    for (const tab of TABS) prefs[tab.type] = getStoredFilter(tab.type)
    return prefs
  })

  const [celebratingTab, setCelebratingTab] = useState<string | null>(null)
  const [shimmeringId, setShimmeringId] = useState<string | null>(null)
  const [farewellId, setFarewellId] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const currentSort = sortPrefs[activeTab] ?? 'newest'
  const currentLimit = limitPrefs[activeTab] ?? DEFAULT_LIMIT
  const currentFilter = filterPrefs[activeTab] ?? 'all'

  const filteredRecords = useMemo(() => filterByStatus(records, currentFilter), [records, currentFilter])
  const sortedRecords = useMemo(() => sortRecords(filteredRecords, currentSort), [filteredRecords, currentSort])
  const visibleRecords = useMemo(() => sortedRecords.slice(0, currentLimit), [sortedRecords, currentLimit])

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

  function handleSortChange(sort: SortOption) {
    setSortPrefs((prev) => ({ ...prev, [activeTab]: sort }))
    try { localStorage.setItem(`mustard-sort-${activeTab}`, sort) } catch { /* noop */ }
  }

  function handleLimitChange(limit: number) {
    setLimitPrefs((prev) => ({ ...prev, [activeTab]: limit }))
    try { localStorage.setItem(`mustard-limit-${activeTab}`, String(limit)) } catch { /* noop */ }
  }

  function handleFilterChange(filter: StatusFilter) {
    setFilterPrefs((prev) => ({ ...prev, [activeTab]: filter }))
    try { localStorage.setItem(`mustard-filter-${activeTab}`, filter) } catch { /* noop */ }
  }

  function handleRecordClick(record: MustardRecord) {
    setSelectedRecord(record)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  function handleAddClick() {
    setSelectedRecord(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  function handleDrawerClose() {
    setDrawerOpen(false)
    setSelectedRecord(null)
  }

  async function handleDelete(id: string) {
    const controller = new AbortController()
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        signal: controller.signal,
      })
      if (!res.ok) return
      handleDrawerClose()
      // Play farewell animation before removing from list
      setFarewellId(id)
      setTimeout(() => {
        setFarewellId(null)
        setCountsLoaded(false)
        fetchRecords(activeTab)
      }, 500)
    } catch {
      // delete failed — drawer stays open
    }
  }

  async function handleDrawerSave(data: Partial<MustardRecord> & { log_type: string }) {
    try {
      if (drawerMode === 'edit' && data.id) {
        const res = await fetch(`/api/records/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) return
        // Trigger edit shimmer on the updated item
        setShimmeringId(data.id)
        setTimeout(() => setShimmeringId(null), 800)
      } else {
        const res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) return
        // Trigger create celebration on the active tab
        setCelebratingTab(activeTab)
        setTimeout(() => setCelebratingTab(null), 600)
      }
      handleDrawerClose()
      setCountsLoaded(false)
      fetchRecords(activeTab)
    } catch {
      // save failed — drawer stays open
    }
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
        {!collapsed && (
          <button
            className="crud-panel-add"
            onClick={handleAddClick}
            aria-label="Add record"
            data-testid="panel-add"
          >
            +
          </button>
        )}
      </div>
      {!collapsed && (
        <>
          <div className="crud-panel-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.type}
                role="tab"
                aria-selected={activeTab === tab.type}
                className={`crud-panel-tab crud-panel-tab--${tab.type}${activeTab === tab.type ? ' crud-panel-tab--active' : ''}${celebratingTab === tab.type ? ' crud-panel-tab--celebrate' : ''}`}
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
              <>
                <ListControls
                  sort={currentSort}
                  onSortChange={handleSortChange}
                  limit={currentLimit}
                  onLimitChange={handleLimitChange}
                  totalRecords={filteredRecords.length}
                  statusFilter={currentFilter}
                  onStatusFilterChange={handleFilterChange}
                  showStatusFilter={activeTab === 'todo'}
                />
                <div className="crud-panel-list" data-testid="panel-list">
                  {visibleRecords.map((record) => (
                    <div
                      key={record.id}
                      data-testid="panel-list-item"
                      onClick={() => handleRecordClick(record)}
                      style={{ cursor: 'pointer' }}
                      className={`${shimmeringId === record.id ? 'list-item-shimmer' : ''}${farewellId === record.id ? ' list-item-farewell' : ''}`}
                    >
                      <ListItem record={record} type={activeTab} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
      <DetailDrawer
        record={selectedRecord}
        mode={drawerMode}
        defaultLogType={activeTab}
        open={drawerOpen}
        onClose={handleDrawerClose}
        onSave={handleDrawerSave}
        onDelete={handleDelete}
      />
    </aside>
  )
}
