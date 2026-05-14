function ReportFilters({ filters, onFilterChange, onRefresh }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm p-6 mb-8">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
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

        <div className="flex gap-3 pt-3 xl:pt-0">
          <button
            onClick={onRefresh}
            className="rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportFilters;
