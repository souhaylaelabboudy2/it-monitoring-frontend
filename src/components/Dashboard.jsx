import { useEffect, useState } from "react";
import API from "../services/api";
import ServerCard from "./ServerCard";
import Alerts from "./Alerts";

function Dashboard() {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    API.get("/servers").then((res) => {
      setServers(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Servers</h2>

      {servers.map((server) => (
        <ServerCard key={server.id} server={server} />
      ))}

      <Alerts />
    </div>
  );
}

export default Dashboard;