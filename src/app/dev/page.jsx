"use client";

import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Navbar } from "../components/Navbar";

export default function DevPage() {
  const { user, isLoading: userLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeed = async (clean = false) => {
    if (!user?.sub) {
      setError("Please log in first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = `/api/seed?demo=true${clean ? "&clean=true" : ""}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.sub }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to seed data");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar user={user} isLoading={userLoading} />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h1>Dev Tools</h1>
          <p>Please <a href="/api/auth/login">log in</a> to access dev tools.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} isLoading={userLoading} />
      <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>🔧 Dev Tools - Seed Data</h1>
        <p style={{ marginBottom: "10px", opacity: 0.7 }}>
          Demo-only tools for hackathon presentation. Use with caution.
        </p>
        <p style={{ marginBottom: "30px", fontSize: "14px", opacity: 0.6 }}>
          After seeding, you'll be redirected to the Calendar to see your logs. Or view them in{" "}
          <a href="/calendar" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            Calendar
          </a>{" "}
          or{" "}
          <a href="/heatcalendar" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            Heat Map
          </a>
          .
        </p>

        <div style={{ display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleSeed(false)}
            disabled={loading}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "➕ Add Seed Data (Safe)"}
          </button>

          <button
            onClick={() => handleSeed(true)}
            disabled={loading}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "🗑️ Clean & Seed (Destructive)"}
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "15px",
              background: "#fee2e2",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              color: "#991b1b",
              marginBottom: "20px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div
            style={{
              padding: "20px",
              background: "var(--textbox)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>✅ Seed Complete</h3>
            <div style={{ marginBottom: "10px" }}>
              <strong>Deleted:</strong> {result.deleted || 0} logs
            </div>
            <div style={{ marginBottom: "10px" }}>
              <strong>Inserted:</strong> {result.inserted} seed logs
            </div>
            <div style={{ marginBottom: "15px", fontSize: "14px", opacity: 0.8 }}>
              {result.note}
            </div>
            <details style={{ marginTop: "15px" }}>
              <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
                Seed Data Details
              </summary>
              <pre
                style={{
                  background: "var(--background)",
                  padding: "15px",
                  borderRadius: "6px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(result.seedData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div
          style={{
            marginTop: "40px",
            padding: "15px",
            background: "var(--textbox)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>📋 What This Does</h3>
          <ul style={{ marginBottom: 0, paddingLeft: "20px" }}>
            <li>
              <strong>Add Seed Data (Safe):</strong> Adds realistic CHF scenario logs without deleting existing data
            </li>
            <li>
              <strong>Clean & Seed (Destructive):</strong> Deletes all your logs, then adds realistic CHF scenario logs
            </li>
            <li>
              <strong>Realistic CHF Scenario:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                <li>7 days ago: CHF monitoring started</li>
                <li>5 days ago: Baseline weight (149 lbs)</li>
                <li>4 days ago: Shortness of breath</li>
                <li>3 days ago: Weight check (149.5 lbs)</li>
                <li>2 days ago: Fatigue</li>
                <li>Yesterday: Weight check (150 lbs)</li>
              </ul>
            </li>
            <li>
              <strong>Demo Trigger:</strong> When you say "I am 153 pounds", it compares to yesterday's 150 lbs → 
              3 lbs gain → <strong>⚠️ CHF Protocol Activated: TAKE_LASIX</strong>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
