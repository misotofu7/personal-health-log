"use client";

import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../lib/storage";

/* note that Date objects are built into javascript as pre-existing classes */

function formatDate(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function getDaysInMonth(year, month) { 
  const days = [];
  const date = new Date(year, month, 1); // creates a new date on the first day of the month
  
const firstWeekDay = new Date(year, month, 1).getDay(); // 0-6


// Add empty slots for days before the first
for (let i = 0; i < firstWeekDay; i++) {
  days.push(null); // empty cell
}

  while (date.getMonth() === month) {
    days.push(new Date(date)); // pushing a pointer-like object onto the days array?
    date.setDate(date.getDate() + 1); // keep getting each date one day at a time
     
  }
  

  return days;
}

/* the following is where the page elements begin */

export const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [phrase, setPhrase] = useState("");

  /* Load posts */
  useEffect(() => {
    setPosts(getFromStorage("calendarPosts", []));
  }, []);

  /* Month navigation */
  function prevMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }

  /* Add post */
  function addPost() {
    if (!phrase || !selectedDate) return;

    const newPost = {
      id: crypto.randomUUID(),
      date: selectedDate,
      timestamp: Date.now(),
      phrase,
    };

    const updated = [...posts, newPost];
    setPosts(updated);
    saveToStorage("calendarPosts", updated);

    setPhrase("");
    setSelectedDate(null);
  }

  /* Group posts by date */
  const postsByDate = posts.reduce((acc, post) => {
    if (!acc[post.date]) acc[post.date] = [];
    acc[post.date].push(post);
    return acc;
  }, {}); // 

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getDaysInMonth(year, month);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {currentMonth.toLocaleString("default", { month: "long" })} {year}
        </h1>

        <div className="space-x-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            ← Prev
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center font-semibold mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
            if (!day) return <div></div>; // empty cell
          const key = formatDate(day);
          const dayPosts = postsByDate[key] || [];

          return (
            <div
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`border rounded p-2 min-h-[100px] cursor-pointer
                hover:bg-gray-100
                ${selectedDate === key ? "bg-blue-100" : "bg-white"}
              `}
            >
              <div className="text-sm font-semibold mb-1">
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayPosts.map((post) => (
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

      {/* Add Event */}
      {selectedDate && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">
            Add event for {selectedDate}
          </h3>

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
}
