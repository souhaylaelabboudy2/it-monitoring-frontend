function ServerCard({ server }) {
  // Determine resource warning colors
  const getResourceColor = (usage) => {
    if (usage === null || usage === undefined) return "bg-gray-300";
    if (usage >= 80) return "bg-red-500";
    if (usage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getResourceTextColor = (usage) => {
    if (usage === null || usage === undefined) return "text-gray-600 dark:text-gray-400";
    if (usage >= 80) return "text-red-600 dark:text-red-400";
    if (usage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const statusBgColor = 
    server.status === "online" 
      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" 
      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";

  const statusIcon = server.status === "online" ? "🟢" : "🔴";

  const displayValue = (usage) => usage !== null && usage !== undefined ? `${usage}%` : "—";
  const widthValue = (usage) => usage !== null && usage !== undefined ? usage : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg dark:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {server.name}
          </h2>
          {server.host && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {server.host}
            </p>
          )}
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ml-2 ${statusBgColor}`}>
          {statusIcon} {server.status?.toUpperCase()}
        </span>
      </div>

      {/* Resource Meters */}
      <div className="space-y-4">
        {/* CPU */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              📊 CPU
            </span>
            <span className={`text-sm font-bold ${getResourceTextColor(server.cpu_usage)}`}>
              {displayValue(server.cpu_usage)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${getResourceColor(server.cpu_usage)}`}
              style={{ width: `${widthValue(server.cpu_usage)}%` }}
            ></div>
          </div>
        </div>

        {/* RAM */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              💾 RAM
            </span>
            <span className={`text-sm font-bold ${getResourceTextColor(server.ram_usage)}`}>
              {displayValue(server.ram_usage)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${getResourceColor(server.ram_usage)}`}
              style={{ width: `${widthValue(server.ram_usage)}%` }}
            ></div>
          </div>
        </div>

        {/* Disk */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              🗄️ Disk
            </span>
            <span className={`text-sm font-bold ${getResourceTextColor(server.disk_usage)}`}>
              {displayValue(server.disk_usage)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${getResourceColor(server.disk_usage)}`}
              style={{ width: `${widthValue(server.disk_usage)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {((server.cpu_usage && server.cpu_usage >= 80) || (server.ram_usage && server.ram_usage >= 80) || (server.disk_usage && server.disk_usage >= 80)) && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-800 dark:text-red-200 font-semibold">
          ⚠️ Critical resource usage detected
        </div>
      )}
      {((server.cpu_usage && server.cpu_usage >= 60) || (server.ram_usage && server.ram_usage >= 60) || (server.disk_usage && server.disk_usage >= 60)) && 
       !((server.cpu_usage && server.cpu_usage >= 80) || (server.ram_usage && server.ram_usage >= 80) || (server.disk_usage && server.disk_usage >= 80)) && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 font-semibold">
          ⚠️ High resource usage - monitor closely
        </div>
      )}
    </div>
  );
}

export default ServerCard;