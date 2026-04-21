function ServerCard({ server }) {
  return (
    <div className="bg-gray-800 p-5 rounded-2xl shadow-lg hover:scale-105 transition">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{server.name}</h2>
        <span className={`px-3 py-1 text-sm rounded-full font-medium
          ${server.status === "online" ? "bg-green-500" : "bg-red-500"}`}>
          {server.status}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>CPU</span><span>{server.cpu_usage}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <div className="bg-blue-400 h-2 rounded" style={{ width: `${server.cpu_usage}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>RAM</span><span>{server.ram_usage}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <div className="bg-green-400 h-2 rounded" style={{ width: `${server.ram_usage}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Disk</span><span>{server.disk_usage}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded">
            <div className="bg-red-400 h-2 rounded" style={{ width: `${server.disk_usage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerCard;