function ServerCard({ server }) {
  return (
    <div style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
      <h3>{server.name}</h3>
      <p>Status: {server.status}</p>
      <p>CPU: {server.cpu_usage}%</p>
      <p>RAM: {server.ram_usage}%</p>
    </div>
  );
}

export default ServerCard;