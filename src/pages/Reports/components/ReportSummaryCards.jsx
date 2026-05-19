function ReportSummaryCards({ metrics, loading }) {
  const cards = [
    { label: "Total Servers", value: metrics.totalServers, icon: "🖥️", accent: "bg-sky-500/15 text-sky-800 dark:text-sky-200" },
    { label: "Online Servers", value: metrics.onlineServers, icon: "✅", accent: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" },
    { label: "Offline Servers", value: metrics.offlineServers, icon: "❌", accent: "bg-rose-500/15 text-rose-800 dark:text-rose-200" },
    { label: "Total Alerts", value: metrics.totalAlerts, icon: "🔔", accent: "bg-violet-500/15 text-violet-800 dark:text-violet-200" },
    { label: "Critical Alerts", value: metrics.criticalAlerts, icon: "🚨", accent: "bg-red-500/15 text-red-800 dark:text-red-200" },
    { label: "Open Incidents", value: metrics.openIncidents, icon: "⚠️", accent: "bg-amber-500/15 text-amber-800 dark:text-amber-200" },
    { label: "Backup Success", value: metrics.backupSuccess, icon: "💾", accent: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" },
    { label: "Backup Failed", value: metrics.backupFailed, icon: "❌", accent: "bg-rose-500/15 text-rose-800 dark:text-rose-200" },
    { label: "Total NVRs", value: metrics.totalNvrs, icon: "📹", accent: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-200" },
    { label: "Online NVRs", value: metrics.onlineNvrs, icon: "✅", accent: "bg-lime-500/15 text-lime-800 dark:text-lime-200" },
    { label: "Offline NVRs", value: metrics.offlineNvrs, icon: "🔴", accent: "bg-rose-500/15 text-rose-800 dark:text-rose-200" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {loading
        ? Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[2rem] bg-gray-100 dark:bg-slate-900 h-36 animate-pulse"
            />
          ))
        : cards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/10 blur-2xl" />
              <div className="relative flex h-36 flex-col items-center justify-center gap-3 p-5 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full border border-current ${card.accent}`}>                  
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="text-2xl font-semibold text-slate-950 dark:text-white">
                  {card.value ?? 0}
                </p>
              </div>
            </div>
          ))}
    </div>
  );
}

export default ReportSummaryCards;
