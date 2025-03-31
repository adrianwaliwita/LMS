import React from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const CourseCompletionVisualization = ({
  courses,
  modules,
  users,
  batches,
}) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyCompletionsData = {
    labels: months,
    datasets: [
      {
        label: "Course Completions",
        data: months.map(() => Math.floor(Math.random() * 50) + 10),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Monthly Course Completions
        </h3>
        <div className="h-64">
          <Line
            data={monthlyCompletionsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCompletionVisualization;
