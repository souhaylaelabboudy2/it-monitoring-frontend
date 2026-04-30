import { useEffect, useState } from "react";
import API from "../services/api";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "low"
  });

  const fetchIncidents = async () => {
    try {
      const res = await API.get("/incidents");
      setIncidents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const addIncident = async () => {
    try {
      await API.post("/incidents", {
        title: form.title,
        description: form.description,
        severity: form.severity,
        status: "open"
      });

      setForm({
        title: "",
        description: "",
        severity: "low"
      });

      fetchIncidents();
    } catch (err) {
      console.log(err.response); // ✅ تم التغيير
    }
  };

  const resolveIncident = async (id) => {
    try {
      await API.put(`/incidents/${id}`, {
        status: "resolved"
      });

      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h2 className="text-2xl mb-4">Incidents</h2>

      {/* FORM */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Title"
          className="p-2 mr-2 text-black"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          className="p-2 mr-2 text-black"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select
          className="p-2 mr-2 text-black"
          value={form.severity}
          onChange={(e) => setForm({ ...form, severity: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button onClick={addIncident} className="bg-blue-500 px-4 py-2 rounded">
          Add
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id} className="text-center border-t border-gray-700">
              <td>{inc.title}</td>

              <td>
                <span
                  className={
                    inc.severity === "high"
                      ? "text-red-400"
                      : inc.severity === "medium"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                >
                  {inc.severity}
                </span>
              </td>

              <td>
                <span
                  className={
                    inc.status === "resolved" ? "text-green-400" : "text-red-400"
                  }
                >
                  {inc.status}
                </span>
              </td>

              <td>
                {inc.status === "open" && (
                  <button
                    onClick={() => resolveIncident(inc.id)}
                    className="bg-green-500 px-2 py-1 rounded"
                  >
                    Resolve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Incidents;