"use client";

import { useEffect, useState } from "react";

// Generate last 90 days
function getLast90Days() {
  const days = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
}

// Heat color based on severity/intensity
const getHeatColor = (maxSeverity) => {
  if (!maxSeverity || maxSeverity === 0) return "bg-gray-100 border-gray-200";
  if (maxSeverity === 1) return "bg-green-200 border-green-300";
  if (maxSeverity === 2) return "bg-yellow-300 border-yellow-400";
  if (maxSeverity === 3) return "bg-orange-400 border-orange-500";
  return "bg-red-500 border-red-600"; // severity 4
};

export const HomeHeatmap = ({ refreshTrigger, userId = null, localUserId = null }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Build query params - include userId if logged in, or localUserId if anonymous
    const params = new URLSearchParams();
    if (userId) {
      params.append("userId", userId);
    } else if (localUserId) {
      params.append("localUserId", localUserId);
    }
    const url = `/api/logs?${params.toString()}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshTrigger, userId, localUserId]);

  const logsByDate = logs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = { count: 0, maxSeverity: 0 };
    }
    acc[date].count += 1;
    acc[date].maxSeverity = Math.max(acc[date].maxSeverity, log.level || log.count || 0);
    return acc;
  }, {});

  const days = getLast90Days();
  
  // Group into rows - more horizontal (15 days per row)
  const rows = [];
  const daysPerRow = 15;
  for (let i = 0; i < days.length; i += daysPerRow) {
    rows.push(days.slice(i, i + daysPerRow));
  }

  if (loading) {
    return (
      <div className="heatmap-container" style={{ margin: "24px auto", maxWidth: "800px" }}>
        <p style={{ textAlign: "center", color: "var(--foreground)", opacity: 0.6 }}>Loading heatmap...</p>
      </div>
    );
  }

  return (
    <div className="heatmap-container" style={{ margin: "12px auto", maxWidth: "100%", padding: "0 16px", width: "100%" }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "3px",
        alignItems: "center"
      }}>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ 
            display: "flex", 
            flexDirection: "row", 
            gap: "3px",
            justifyContent: "center"
          }}>
            {row.map((day) => {
              const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
              const dayData = logsByDate[dateKey];
              const maxSeverity = dayData?.maxSeverity || 0;
              const colorClass = getHeatColor(maxSeverity);
              const isToday = dateKey === new Date().toISOString().split("T")[0];
              
              return (
                <div
                  key={dateKey}
                  className={colorClass}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "2px",
                    border: isToday ? "2px solid var(--accent)" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "transform 0.1s",
                  }}
                  title={`${dateKey}: ${dayData ? `${dayData.count} log(s), max severity ${maxSeverity}` : 'No logs'}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: "8px", 
        marginTop: "8px",
        fontSize: "11px",
        color: "var(--foreground)",
        opacity: 0.6

      }}>
        
        <span>Less</span>
        <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
          <div style={{ width: "11px", height: "11px", borderRadius: "2px", background: "var(--gray-100)", border: "1px solid var(--gray-200)" }} />
          <div style={{ width: "11px", height: "11px", borderRadius: "2px", background: "#fef08a", border: "1px solid #facc15" }} />
          <div style={{ width: "11px", height: "11px", borderRadius: "2px", background: "#fb923c", border: "1px solid #f97316" }} />
          <div style={{ width: "11px", height: "11px", borderRadius: "2px", background: "#ef4444", border: "1px solid #dc2626" }} />
        </div>
        <span>More</span>

      </div>
    </div>
  );
};
