'use client'

import { useState, useEffect } from "react";
import { Square, X } from "lucide-react";

export const ModalPopup = ({ isModal, selectedDate }) => {
  const [logs, setLogs] = useState([]);
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => setLogs(data.logs || []));
  }, []);

  // Group logs by date
  const logsByDate = logs.reduce((acc, log) => {
    const date = log.date;
    acc[date] = (acc[date] || []).concat(log);
    return acc;
  }, {});

  // Optional: color intensity based on number of logs
  const getColorClass = (count) => {
    if (count >= 3) return "text-blue-800 bg-blue-800";
    if (count === 2) return "text-blue-500 bg-blue-500";
    if (count === 1) return "text-blue-200 bg-blue-200";
    return "text-gray-100 bg-gray-100";
  };

  const dayLogs = logsByDate[selectedDate] || [];

  return (
    <div className="p-4 border rounded-lg bg-white shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">Logs for {selectedDate}</h2>
        <button onClick={() => isModal(false)}>
          <X />
        </button>
      </div>

      {dayLogs.length === 0 ? (
        <p>No logs for this day.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {dayLogs.map(log => (
            <div
              key={log.id || log._id}
              className={`p-2 flex items-center gap-2 border rounded ${getColorClass(dayLogs.length)}`}
            >
              <Square className="w-4 h-4" />
              <span>{log.phrase || log.symptom || "No description"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /*
    return (
    <>
       <div className = "backdrop" onClick = {(isModal)}></div>
       <div className = "dialog">
        <div className = "bg-blue-300 p-8 rounded-lg shadow-xs border border-black max-w-xl">
   <div className = "p-3 rounded-full bg-blue-400 inline-block hover:bg-blue-500 transition-colors duration-1000">
    <X className = "h-6 w-6 text-blue-300 transition-colors duration-300" onClick = {(isModal)}/> {' '}
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
    */
}