import {
  Line
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function ServerChart({ server }) {
  const data = {
    labels: ["CPU", "RAM", "Disk"],
    datasets: [
      {
        label: server.name,
        data: [
          server.cpu_usage,
          server.ram_usage,
          server.disk_usage
        ],
      },
    ],
  };

  return <Line data={data} />;
}

export default ServerChart;