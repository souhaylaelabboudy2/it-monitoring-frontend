import { useEffect, useState } from "react";
import API from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    API.get("/alerts").then((res) => {
      setAlerts(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Alerts</h2>

      {alerts.map((alert) => (
        <div key={alert.id}>
          ⚠️ {alert.message}
        </div>
      ))}
    </div>
  );
}

export default Alerts;