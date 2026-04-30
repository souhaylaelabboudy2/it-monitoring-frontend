import { useEffect, useState } from "react";
import API from "../services/api";

function BackupDashboard() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBackups = () => {
      API.get("/backups")
        .then((res) => {
          setBackups(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching backups:", err);
          setLoading(false);
        });
    };

    fetchBackups();
    const interval = setInterval(fetchBackups, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (status.toLowerCase() === "success") {
      return "bg-green-100 text-green-800";
    } else if (status.toLowerCase() === "failed") {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="p-6 text-center">Loading backups...</div>;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Backup Dashboard
      </h2>

      {backups.length === 0 ? (
        <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <p className="text-yellow-800 dark:text-yellow-100">
            No backups found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                  Server Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {backup.server_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        backup.status
                      )}`}
                    >
                      {backup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(backup.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BackupDashboard;
