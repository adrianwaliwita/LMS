import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const RoleVisualizations = ({ users, roleMap }) => {
  // Blue gradient colors from your login page
  const brandColors = [
    "#0300c3", // Dark blue
    "#00c32a",
    "#c30000", // Primary blue
    "#3A6BEE", // Light blue
    "#6C91F2", // Very light blue
  ];

  // Prepare data for role distribution pie chart
  const roleData = {
    labels: Object.values(roleMap),
    datasets: [
      {
        data: Object.keys(roleMap).map(
          (roleId) => users.filter((u) => u.role === parseInt(roleId)).length
        ),
        backgroundColor: brandColors.slice(0, Object.keys(roleMap).length),
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-4">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 ">
        <h3 className="text-lg font-semibold  mb-4 text-center text-blue-700">
          Role Distribution
        </h3>
        <div className="h-64">
          <Pie
            data={roleData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#374151", // gray-700
                    font: {
                      size: 12,
                    },
                    padding: 20,
                    usePointStyle: true,
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.label || "";
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleVisualizations;
