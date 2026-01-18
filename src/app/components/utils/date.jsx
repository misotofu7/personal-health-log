// src/components/utils/date.js

// Format a Date object as YYYY-MM-DD
export function formatDate(date) {
  if (!date) return null;
  return date instanceof Date
    ? date.toISOString().split("T")[0]
    : date; // if already a string, return as is
}

// Generate days in a month including empty slots for first weekday
export function getDaysInMonth(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekday = firstDay.getDay(); // 0 = Sunday
  for (let i = 0; i < firstWeekday; i++) {
    days.push(null); // empty slots
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}
