import { useEffect, useState } from "react";
import API from "../services/api";
import Alerts from "./Alerts";
import ServerCard from "./ServerCard";
import ServerChart from "./ServerChart";
import NotificationPopup from "./NotificationPopup";
import GlobalStats from "./GlobalStats";

function Dashboard() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      API.get("/servers").then((res) => {
        setServers(res.data);
        setLoading(false);
      });
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <NotificationPopup />
      
      <h1 className="text-3xl font-bold mb-8">
        Infrastructure Monitoring System
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <GlobalStats />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servers.map((server) => (
              <div key={server.id}>
                <ServerCard server={server} />
                <ServerChart server={server} />
              </div>
            ))}
          </div>

          <Alerts />
        </>
      )}
    </div>
  );
}

export default Dashboard;