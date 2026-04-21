import { useEffect, useState } from "react";
import API from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = () => {
    setLoading(true);
    API.get("/alerts")
      .then((res) => {
        setAlerts(res.data.data || []);
      })
      .catch((err) => console.error("Erreur lors de la récupération des alertes:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (type) => {
    const colors = {
      server: { bg: "#f8d7da", border: "#f5c6cb", text: "#721c24" },
      nvr: { bg: "#fff3cd", border: "#ffeaa7", text: "#856404" },
      backup: { bg: "#d1ecf1", border: "#bee5eb", text: "#0c5460" },
      general: { bg: "#e2e3e5", border: "#d3d4d5", text: "#383d41" }
    };
    return colors[type] || colors.general;
  };

  const getAlertIcon = (type) => {
    const icons = {
      server: "🖥️",
      nvr: "📹",
      backup: "💾",
      general: "⚠️"
    };
    return icons[type] || icons.general;
  };

  return (
    <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "20px", fontWeight: "600" }}>
        🔔 Dernières Alertes
      </h2>

      {loading && <p style={{ color: "#999" }}>Chargement des alertes...</p>}

      {!loading && alerts.length === 0 && (
        <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>
          ✅ Aucune alerte pour le moment
        </p>
      )}

      {!loading && alerts.length > 0 && (
        <div>
          <p style={{ color: "#666", fontSize: "12px", marginBottom: "10px" }}>
            Total: {alerts.length} alerte(s)
          </p>
          <div style={{ display: "grid", gap: "10px" }}>
            {alerts.map((alert) => {
              const colors = getAlertColor(alert.type);
              return (
                <div
                  key={alert.id}
                  style={{
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "5px",
                    padding: "12px",
                    color: colors.text
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "start", flex: 1 }}>
                      <span style={{ fontSize: "18px" }}>{getAlertIcon(alert.type)}</span>
                      <div>
                        <p style={{ margin: "0 0 5px 0", fontWeight: "600", fontSize: "14px" }}>
                          {alert.message}
                        </p>
                        <p style={{ margin: "0", fontSize: "12px", opacity: 0.8 }}>
                          Type: <strong>{alert.type}</strong> | {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Alerts;