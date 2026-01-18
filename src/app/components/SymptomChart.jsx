"use client";

import { useEffect, useState } from "react";

// Simple bar chart component
export const SymptomChart = ({ logs = [] }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Group logs by symptom and count occurrences
    const symptomCounts = logs.reduce((acc, log) => {
      const symptom = log.symptom || "Unknown";
      acc[symptom] = (acc[symptom] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by count
    const sorted = Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 symptoms

    setChartData(sorted);
  }, [logs]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Symptom Frequency
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No data yet. Start logging symptoms to see trends!
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...chartData.map(d => d.count));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Top Symptoms
      </h3>
      <div className="space-y-3">
        {chartData.map(({ symptom, count }) => {
          const percentage = (count / maxCount) * 100;
          return (
            <div key={symptom} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[60%]">
                  {symptom}
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-semibold">
                  {count}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
