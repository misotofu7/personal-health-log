"use client";

import { useEffect, useState } from "react";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export default function Calendar() {
  const [logs, setLogs] = useState([]);

 useEffect(() => {
  fetch("/api/logs")
    .then(res => res.json())
    .then(data => setLogs(data.logs)); // ← THIS is the fix
}, []);

  const logsByDate = logs.reduce((acc, log) => {
    acc[log.date] ??= [];
    acc[log.date].push(log);
    return acc;
  }, {});

  const today = new Date();
  const days = Array.from({ length: 31 }, (_, i) =>
    new Date(today.getFullYear(), today.getMonth(), i + 1)
  );

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => {
        const key = formatDate(day);
        const dayLogs = logsByDate[key] || [];

        return (
          <div key={key} className="border p-2">
            <div>{day.getDate()}</div>
            {dayLogs.map(log => (
              <div key={log._id}>
                {log.symptom}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}