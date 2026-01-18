"use client";

import { useEffect, useState } from "react";
import { Square } from "lucide-react";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export default function Home() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => setLogs(data.logs));
  }, []);

  // Group logs by date
  const logsByDate = logs.reduce((acc, log) => {
    const date = log.date;
    acc[date] = (acc[date] || []).concat(log);
    return acc;
  }, {});

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(today.getFullYear(), today.getMonth(), i + 1)
  );

  // Determine color intensity based on number of logs
  const getHeatColor = (count) => {
    if (count >= 3) return "text-blue-800 bg-blue-800 rounded-lg";   // hot
    if (count === 2) return "text-blue-500 bg-blue-500 rounded-lg";  // medium
    if (count === 1) return "text-blue-200 bg-blue-200 rounded-lg";  // small
    return "text-gray-100 bg-gray-100";                   // no logs
  };

  return (
    <div className="grid grid-cols-7 gap-2 max-w-xl max-h-xl">
      {days.map(day => {
        const key = formatDate(day);
        const dayLogs = logsByDate[key] || [];
        const colorClass = getHeatColor(dayLogs.length);

        return (
          <div key={key} className="border p-2 flex flex-col items-center">
            <div className="mb-1">{day.getDate()}</div>
            {/* Render a single square with intensity representing number of logs */}
            <Square className={`${colorClass} w-6 h-6`} />
          </div>
        );
      })}
    </div>
  );
}