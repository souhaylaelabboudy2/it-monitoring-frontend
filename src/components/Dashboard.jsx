import { useEffect, useState } from "react";
import API from "../services/api";
import Alerts from "./Alerts";
import ServerCard from "./ServerCard";
import ServerChart from "./ServerChart";
import NotificationPopup from "./NotificationPopup";
import GlobalStats from "./GlobalStats";
import echo from "../echo";

function Dashboard() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟡 1. Polling as fallback only (15s instead of 5s)
  useEffect(() => {
    const fetchData = () => {
      API.get("/servers")
        .then((res) => {
          setServers(res.data);
          setLoading(false);
        })
        // 🟡 4. Error handling
        .catch(() => {
          console.error("Error fetching servers");
          setLoading(false);
        });
    };

    fetchData();

    const interval = setInterval(fetchData, 15000);

    return () => clearInterval(interval);
  }, []);

  // 🟡 2. WebSocket with full cleanup
  useEffect(() => {
    const channel = echo.channel("servers");

    channel.listen("ServerUpdated", (e) => {
      setServers((prev) =>
        prev.map((s) => (s.name === e.server.name ? e.server : s))
      );
    });

    return () => {
      channel.stopListening("ServerUpdated");
      echo.leaveChannel("servers");
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6">
      <NotificationPopup />

      <h1 className="text-3xl font-bold mb-8">
        Infrastructure Monitoring System
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          <GlobalStats />

          {/* 🟡 3. Added mt-6 for spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* 🟡 5. key={server.id} — make sure id exists in DB */}
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