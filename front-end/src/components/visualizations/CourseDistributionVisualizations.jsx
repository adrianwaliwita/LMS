import React from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CoordinatorVisualizations = ({ courses, modules }) => {
  // Course by Category Distribution
  const courseCategories = {};
  courses.forEach((course) => {
    const category = course.categoryName || "Uncategorized";
    courseCategories[category] = (courseCategories[category] || 0) + 1;
  });

  const courseCategoryData = {
    labels: Object.keys(courseCategories),
    datasets: [
      {
        label: "Courses by Category",
        data: Object.values(courseCategories),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#EC4899",
          "#14B8A6",
          "#F97316",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Course Level Distribution
  const courseLevels = {};
  courses.forEach((course) => {
    const level = course.levelName || "Unknown";
    courseLevels[level] = (courseLevels[level] || 0) + 1;
  });

  const courseLevelData = {
    labels: Object.keys(courseLevels),
    datasets: [
      {
        label: "Courses by Level",
        data: Object.values(courseLevels),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Modules per Course
  const modulesPerCourse = {};
  courses.forEach((course) => {
    const courseModules = modules.filter(
      (module) => module.courseId === course.id
    );
    const moduleCount = courseModules.length;
    modulesPerCourse[course.title] = moduleCount;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Course by Level Doughnut Chart */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-blue-700 mb-2 text-center">
          Course Distribution by Level
        </h3>
        <div className="h-64">
          <Doughnut
            data={courseLevelData}
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
      {/* Course by Category Pie Chart */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-blue-700 mb-2 text-center">
          Course Distribution by Category
        </h3>
        <div className="h-64">
          <Pie
            data={courseCategoryData}
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

export default CoordinatorVisualizations;
