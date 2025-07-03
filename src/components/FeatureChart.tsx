import { Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip } from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface FeatureChartProps {
  features: number[];
  labels: string[];
}

export function FeatureChart({ features, labels }: FeatureChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "Strength",
        data: features,
        backgroundColor: "rgba(29, 185, 84, 0.1)",
        borderColor: "rgba(29, 185, 84, 0.8)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(29, 185, 84, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        ticks: { display: false },
        grid: { color: "rgba(209, 213, 219, 0.5)" },
      },
    },
    plugins: { legend: { display: false } },
  };

  return <Radar data={data} options={options} />;
}
