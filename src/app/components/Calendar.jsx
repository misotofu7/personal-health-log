'use client';

import { useEffect, useState } from "react";
import { Square } from "lucide-react";

import { ModalPopup } from "./ModalPopup";
import { formatDate, getDaysInMonth } from "./utils/date";

export const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Fetch logs from API
  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => setLogs(data.logs || []));
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getDaysInMonth(year, month);

  const todayKey = formatDate(new Date());

  // Group logs by date for heat squares
  const postsByDate = logs.reduce((acc, post) => {
    if (!acc[post.date]) acc[post.date] = [];
    acc[post.date].push(post);
    return acc;
  }, {});

  // Determine color intensity for heat squares
  const getColorClass = (count) => {
    if (count >= 3) return "bg-purple-800";
    if (count === 2) return "bg-purple-500";
    if (count === 1) return "bg-purple-300";
    return "bg-gray-200";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          ← Prev
        </button>
        <h1 className="text-2xl font-bold">
          {currentMonth.toLocaleString("default", { month: "long" })} {year}
        </h1>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          Next →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center font-semibold mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />; // empty slot

          const key = formatDate(day);
          const dayPosts = postsByDate[key] || [];
          const colorClass = getColorClass(dayPosts.length);

          return (
            <div
              key={key}
              className={`p-1 border min-h-[80px] cursor-pointer rounded
                ${selectedDate === key ? "ring-2 ring-purple-500" : ""}`}
              onClick={() => {
                setSelectedDate(key);
                setModalOpen(true);
              }}
            >
              {/* Day number */}
              <div
                className={`text-sm font-semibold mb-1 flex items-center justify-center
                  ${todayKey === key ? "bg-red-500 text-white rounded-full w-6 h-6" : ""}
                `}
              >
                {day.getDate()}
              </div>

              {/* Heat squares */}
              <div className="flex flex-wrap gap-1">
                {dayPosts.map(post => (
                  <Square
                    key={post.id || post._id}
                    className={`w-3 h-3 rounded ${colorClass}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && selectedDate && (
        <ModalPopup
          selectedDate={selectedDate}
          logs={logs}
          closeModal={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
