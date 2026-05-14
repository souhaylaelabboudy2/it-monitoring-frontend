import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

function ReportCharts({ chartRefs, data }) {
  const { alertSeverity, incidentStatus, backupOutcome, serverStatus, nvrStatus } = data;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Alerts by severity</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Alert distribution</h3>
          </div>
        </div>
        <Doughnut ref={chartRefs.alertSeverityRef} data={alertSeverity} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Incidents by status</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Incident state</h3>
          </div>
        </div>
        <Bar ref={chartRefs.incidentStatusRef} data={incidentStatus} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Backup results</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Success vs failed</h3>
          </div>
        </div>
        <Doughnut ref={chartRefs.backupOutcomeRef} data={backupOutcome} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-sm xl:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Servers online/offline</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Server availability</h3>
          </div>
        </div>
        <Bar ref={chartRefs.serverStatusRef} data={serverStatus} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 shadow-sm xl:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NVR status</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">NVR availability</h3>
          </div>
        </div>
        <Bar ref={chartRefs.nvrStatusRef} data={nvrStatus} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
}

export default ReportCharts;
