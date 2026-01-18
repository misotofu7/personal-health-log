'use client'

import { useState } from "react";

export const ModalPopup = ({isModal}) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [phrase, setPhrase] = useState("");

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

    return (
    <>
       <div className = "backdrop" onClick = {(isModal)}></div>
       <div className = "dialog">
        <div className = "bg-blue-300 p-8 rounded-lg shadow-xs border border-black max-w-xl">
   <div className = "p-3 rounded-full bg-blue-400 inline-block hover:bg-blue-500 transition-colors duration-1000">
    <button className = "h-6 w-6 text-blue-300 transition-colors duration-300" onClick = {(isModal)}> close modal </button>
    </div>

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
    
    <p className = "text-sm text-black"> test </p>
    <p className = "text-lg text-blue-950 text-center mb-5"> test popup </p>
    <h1 className = "text-md text-black text-center mb-5"> 
        test popup
    </h1>
    </div>
    </div>
    </>
    )
}