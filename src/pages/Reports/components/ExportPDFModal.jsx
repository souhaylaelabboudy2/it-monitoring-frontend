import { useEffect, useState } from "react";

function ExportPDFModal({ open, onClose, onGenerate, loading }) {
  const sections = [
    { key: "summary", label: "Summary" },
    { key: "alerts", label: "Alerts" },
    { key: "incidents", label: "Incidents" },
    { key: "backups", label: "Backups" },
    { key: "servers", label: "Servers" },
    { key: "nvrs", label: "NVRs" },
    { key: "charts", label: "Charts" },
  ];

  const [selected, setSelected] = useState({
    summary: true,
    alerts: true,
    incidents: true,
    backups: true,
    servers: true,
    nvrs: true,
    charts: true,
  });

  useEffect(() => {
    if (open) {
      setSelected({
        summary: true,
        alerts: true,
        incidents: true,
        backups: true,
        servers: true,
        nvrs: true,
        charts: true,
      });
    }
  }, [open]);

  const toggleSection = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const exportAll = Object.values(selected).every(Boolean);

  return !open ? null : (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-950 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Export RSSI report</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Choose the sections to include in the PDF export.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => toggleSection(section.key)}
              className={`rounded-3xl border p-4 text-left transition ${selected[section.key] ? "border-slate-900 bg-slate-100 dark:border-slate-400 dark:bg-slate-900" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-900 dark:text-white">{section.label}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{selected[section.key] ? "Included" : "Excluded"}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setSelected(Object.fromEntries(sections.map((section) => [section.key, !exportAll]))) }
            className="rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
          >
            {exportAll ? "Deselect All" : "Select All"}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onGenerate(selected)}
              disabled={loading}
              className="rounded-2xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {loading ? "Generating..." : "Generate PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportPDFModal;
