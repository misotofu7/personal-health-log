'use client';

import { Square, X } from "lucide-react";
import { formatDate } from "./utils/date";

export const ModalPopup = ({ selectedDate, logs, closeModal }) => {
  // Group logs by date
  const logsByDate = logs.reduce((acc, log) => {
    const date = log.date;
    acc[date] = (acc[date] || []).concat(log);
    return acc;
  }, {});

  const dayLogs = logsByDate[selectedDate] || [];

  return (
    <>
    <div className="backdrop" onClick={(closeModal)}></div>
      <div className="dialog bg-white p-4 m-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Logs for {selectedDate}</h2>
            <X className = "h-6 w-6 text-primary hover:scale-120 transition-colors duration-300 justify-self-end" onClick = {(closeModal)}/> {" "}
        </div>

        {dayLogs.length === 0 ? (
          <p>No logs for this day.</p>
        ) : (
          <div className="space-y-2">
            {dayLogs.map(log => (
              <div
                key={log.id || log._id}
                className="flex items-center gap-2 border p-2 rounded"
              >
                <h1 className="text-black">{log.symptom || "No description"}</h1>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
  );
};

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