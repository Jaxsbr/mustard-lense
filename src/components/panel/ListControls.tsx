import type { SortOption, StatusFilter } from './sort.js'
import './ListControls.css'

interface ListControlsProps {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  limit: number
  onLimitChange: (limit: number) => void
  totalRecords: number
  statusFilter: StatusFilter
  onStatusFilterChange: (filter: StatusFilter) => void
  showStatusFilter: boolean
}

const LIMIT_OPTIONS = [10, 25, 50, 100]

export function ListControls({ sort, onSortChange, limit, onLimitChange, totalRecords, statusFilter, onStatusFilterChange, showStatusFilter }: ListControlsProps) {
  return (
    <div className="list-controls" data-testid="list-controls">
      <div className="list-controls-sort">
        <select
          className="list-controls-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          data-testid="sort-select"
        >
          <option value="newest">📅 Date desc</option>
          <option value="oldest">📅 Date asc</option>
        </select>
        {showStatusFilter && (
          <select
            className="list-controls-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            data-testid="status-filter-select"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
            <option value="parked">Parked</option>
          </select>
        )}
      </div>
      <div className="list-controls-limit">
        <label className="list-controls-label">Show</label>
        <select
          className="list-controls-select"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          data-testid="limit-select"
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        {totalRecords > limit && (
          <button
            className="list-controls-show-all"
            onClick={() => onLimitChange(totalRecords)}
            data-testid="show-all-button"
          >
            Show all ({totalRecords})
          </button>
        )}
      </div>
    </div>
  )
}
