'use client';

import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Generate all days in a year
function getYearDays(year) {
  const days = [];
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);
  let current = new Date(firstDay);

  while (current <= lastDay) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

// Heat color based on number of logs
const getHeatColor = (count) => {
  if (count >= 3) return "text-blue-800 bg-blue-800";
  if (count === 2) return "text-blue-500 bg-blue-500";
  if (count === 1) return "text-blue-200 bg-blue-200";
  return "text-gray-100 bg-gray-100";
};

export const HeatCalendar = () => {
  const [logs, setLogs] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [localUserId, setLocalUserId] = useState(null);
  const { user } = useUser();

  // Get localUserId from localStorage (only if not logged in)
  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      const storedId = localStorage.getItem("localUserId");
      if (storedId) {
        setLocalUserId(storedId);
      }
    } else if (user) {
      setLocalUserId(null);
    }
  }, [user]);

  // Fetch logs from API with userId or localUserId
  useEffect(() => {
    const params = new URLSearchParams();
    if (user?.sub) {
      params.append("userId", user.sub);
    } else if (localUserId) {
      params.append("localUserId", localUserId);
    } else {
      return; // Wait for user/localUserId
    }
    
    fetch(`/api/logs?${params.toString()}`)
      .then(res => res.json())
      .then(data => setLogs(data.logs || []));
  }, [user, localUserId]);

  const logsByDate = logs.reduce((acc, log) => {
    acc[log.date] = (acc[log.date] || []).concat(log);
    return acc;
  }, {});

  const days = getYearDays(year);

  // Split by month for labeling
  const months = Array.from({ length: 12 }).map((_, m) => {
    const monthDays = days.filter(d => d.getMonth() === m);

    // Add nulls at start to align weekdays
    const firstWeekday = monthDays[0].getDay();
    const paddedDays = Array.from({ length: firstWeekday }, () => null).concat(monthDays);

    return { month: m, days: paddedDays };
  });

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
        <div className="font-bold text-3xl text-center">{year}</div>
        <h3 className="font-medium text-l text-center mb-5"> A look at your year in terms of symptoms & intensity. </h3>
      <div className="rounded-lg p-4 m-3 grid grid-cols-4 gap-4 heat-panel">
        {months.map(({ month, days }) => (
          <div key={month}>
            <div className="text-center font-semibold mb-1">
              {new Date(year, month, 1).toLocaleString("default", { month: "short" })}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                if (!day) return <div key={i} className="w-4 h-4 rounded-lg" />;

                const dateKey = formatDate(day);
                const count = (logsByDate[dateKey] || []).length;
                const colorClass = getHeatColor(count);

                return <Square key={dateKey} className={`${colorClass} w-4 h-4 rounded-sm m-0.2`} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
