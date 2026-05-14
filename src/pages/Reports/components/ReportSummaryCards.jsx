function ReportSummaryCards({ metrics, loading }) {
  const cards = [
    { label: "Total Servers", value: metrics.totalServers, icon: "🖥️", accent: "from-sky-100 to-sky-200" },
    { label: "Online Servers", value: metrics.onlineServers, icon: "✅", accent: "from-emerald-100 to-emerald-200" },
    { label: "Offline Servers", value: metrics.offlineServers, icon: "❌", accent: "from-rose-100 to-rose-200" },
    { label: "Total Alerts", value: metrics.totalAlerts, icon: "🔔", accent: "from-violet-100 to-violet-200" },
    { label: "Critical Alerts", value: metrics.criticalAlerts, icon: "🚨", accent: "from-red-100 to-red-200" },
    { label: "Open Incidents", value: metrics.openIncidents, icon: "⚠️", accent: "from-amber-100 to-amber-200" },
    { label: "Backup Success", value: metrics.backupSuccess, icon: "💾", accent: "from-green-100 to-green-200" },
    { label: "Backup Failed", value: metrics.backupFailed, icon: "❌", accent: "from-pink-100 to-pink-200" },
    { label: "Total NVRs", value: metrics.totalNvrs, icon: "📹", accent: "from-cyan-100 to-cyan-200" },
    { label: "Online NVRs", value: metrics.onlineNvrs, icon: "✅", accent: "from-lime-100 to-lime-200" },
    { label: "Offline NVRs", value: metrics.offlineNvrs, icon: "🔴", accent: "from-rose-100 to-rose-200" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {loading
        ? Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl bg-gray-100 dark:bg-slate-900 h-32 animate-pulse"
            ></div>
          ))
        : cards.map((card) => (
            <div
              key={card.label}
              className={`rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${card.accent} p-6`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    {card.label}
                  </p>
                  <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
                    {card.value ?? 0}
                  </p>
                </div>
                <div className="text-5xl opacity-80">{card.icon}</div>
              </div>
            </div>
          ))}
    </div>
  );
}

export default ReportSummaryCards;
