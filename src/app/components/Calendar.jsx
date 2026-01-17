"use client";

import { useEffect, useState } from "react";
import { getFromStorage, saveToStorage } from "../lib/storage";

import { ModalPopup } from "./ModalPopup";

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

  const [ isModalOpen, setModalOpen ] = useState(false);

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
    
    //but, if you try to go ahead, you cannot 
  }

  /* Add post */
  function addPost() {
    if (!phrase || !selectedDate) return;

    const newPost = {
      id: crypto.randomUUID(),
      date: selectedDate,
      timestamp: Date.now(),
      tags: [],
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
  const days = getDaysInMonth(year, month); // existing javascript function

  return (
    <div className="p-6 max-w-5xl mx-auto">
     <button className="px-3 bg-blue-200 rounded-lg hover:scale-105" onClick = {() => {setModalOpen(!isModalOpen)}}> test button </button>

      { isModalOpen ? ( <ModalPopup isModal = {() => setModalOpen(false)}/>) : null }
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          {currentMonth.toLocaleString("default", { month: "long" })} {year}
        </h1>

        <div className="space-x-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1 rounded text-black bg-gray-200 hover:bg-blue-200"
          >
            ← Prev
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 rounded text-black bg-gray-200 hover:bg-blue-200"
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
        {days.map((day, i) => {
            if (!day) return <div key = {`empty-${i}`}></div>; // fix to the empty cell issue
          const key = formatDate(day);
          const dayPosts = postsByDate[key] || [];
          const currDate = new Date();

          return (
            <div
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`border rounded p-2 min-h-[100px] cursor-pointer
                hover:bg-blue-200
                ${selectedDate === key ? "bg-purple-500" : "bg-white"} 
              `}
            > 

              <div className="text-sm font-semibold text-blue-900 mb-1">
                {formatDate(currDate) === key ? <div className="flex items-center justify-center rounded-full w-6 h-6 bg-red-500 text-white"> {day.getDate()} </div> : day.getDate()}
              </div>

              <div className="space-y-1">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-pink-200 text-blue-900 text-xs px-1 py-0.5 rounded"
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
