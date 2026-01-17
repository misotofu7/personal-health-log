"use client";

import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../lib/storage";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function getDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export const YearCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [posts, setPosts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [phrase, setPhrase] = useState("");

  // Load posts from localStorage
  useEffect(() => {
    setPosts(getFromStorage("calendarPosts", []));
  }, []);

  // Add post
  const addPost = () => {
    if (!selectedDate || !phrase) return;

    const newPost = {
      id: crypto.randomUUID(),
      date: selectedDate,
      timestamp: Date.now(),
      phrase,
    };

    const updated = [...posts, newPost];
    setPosts(updated);
    saveToStorage("calendarPosts", updated);

    setSelectedDate(null);
    setPhrase("");
  };

  // Group posts by date
  const postsByDate = posts.reduce((acc, post) => {
    if (!acc[post.date]) acc[post.date] = [];
    acc[post.date].push(post);
    return acc;
  }, {});

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Year Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{year}</h1>
        <div className="space-x-2">
          <button
            onClick={() => setYear(prev => prev - 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            ← Prev Year
          </button>
          <button
            onClick={() => setYear(prev => prev + 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Next Year →
          </button>
        </div>
      </div>

      {/* Year Grid: 12 Months */}
      <div className="grid grid-cols-3 gap-6">
        {monthNames.map((monthName, monthIndex) => {
          const days = getDaysInMonth(year, monthIndex);

          return (
            <div key={monthIndex} className="border rounded p-2 bg-white">
              <h2 className="text-xl font-semibold mb-2">{monthName}</h2>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                  const key = formatDate(day);
                  const dayPosts = postsByDate[key] || [];

                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedDate(key)}
                      className={`border rounded min-h-[60px] p-1 cursor-pointer
                        hover:bg-gray-100
                        ${selectedDate === key ? "bg-blue-100" : "bg-white"}
                      `}
                    >
                      <div className="text-xs font-semibold mb-1">{day.getDate()}</div>
                      <div className="space-y-1">
                        {dayPosts.map(post => (
                          <div
                            key={post.id}
                            className="bg-blue-200 text-blue-900 text-xs px-1 py-0.5 rounded"
                          >
                            {post.phrase}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event */}
      {selectedDate && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Add event for {selectedDate}</h3>
          <div className="flex gap-2">
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="Event phrase"
              className="flex-1 border rounded px-2 py-1"
            />
            <button
              onClick={addPost}
              className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

