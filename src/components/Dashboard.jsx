import { useEffect, useState } from "react";
import API from "../services/api";
import Alerts from "./Alerts";
import ServerCard from "./ServerCard";

function Dashboard() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    API.get("/servers").then((res) => setServers(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        Infrastructure Monitoring System
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      <Alerts />
    </div>
  );
}

export default Dashboard;