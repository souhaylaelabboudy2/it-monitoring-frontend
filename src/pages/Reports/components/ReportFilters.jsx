import { useState } from "react";

function ReportFilters({ filters, onFilterChange, onRefresh, isRefreshing = false }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm overflow-hidden mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Filters</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Compact reporting controls for date range, severity, status, and resource selection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-2xl border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            {isOpen ? "Hide filters" : "Show filters"}
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <label className="flex flex-col text-sm text-slate-700 dark:text-slate-300">
              Date from
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => onFilterChange({ ...filters, fromDate: e.target.value })}
                className="mt-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700 dark:text-slate-300">
              Date to
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => onFilterChange({ ...filters, toDate: e.target.value })}
                className="mt-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3"
              />
            </label>
            <label className="flex flex-col text-sm text-slate-700 dark:text-slate-300">
              Severity
              <select
                value={filters.severity}
                onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
                className="mt-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3"
              >
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-700 dark:text-slate-300">
              Status
              <select
                value={filters.status}
                onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                className="mt-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3"
              >
                <option value="all">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </label>
            <label className="flex flex-col text-sm text-slate-700 dark:text-slate-300">
              Resource type
              <select
                value={filters.resource}
                onChange={(e) => onFilterChange({ ...filters, resource: e.target.value })}
                className="mt-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-3"
              >
                <option value="all">All</option>
                <option value="servers">Servers</option>
                <option value="alerts">Alerts</option>
                <option value="incidents">Incidents</option>
                <option value="backups">Backups</option>
                <option value="nvrs">NVRs</option>
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportFilters;
