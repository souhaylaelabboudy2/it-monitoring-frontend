import { useEffect, useState } from "react";
import API from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = () => {
      API.get("/alerts").then((res) => {
        setAlerts(res.data);
      });
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Alerts</h2>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-red-500/20 border border-red-500 p-3 rounded mb-2"
        >
          ⚠️ {alert.message}
        </div>
      ))}
    </div>
  );
}

export default Alerts;