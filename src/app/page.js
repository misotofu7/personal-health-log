"use client";

import { useState, useEffect } from "react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { Navbar } from "./components/Navbar";
import { HomeHeatmap } from "./components/HomeHeatmap";
import { useUser } from "@auth0/nextjs-auth0/client";
import { playAudioResponse } from "../lib/tts";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [localUserId, setLocalUserId] = useState(null);
  const { user, isLoading, error } = useUser();
  

  // Generate localUserId for anonymous users (only if not logged in)
  // This persists in localStorage, so anonymous logs remain visible after sign out
  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      // Restore localUserId from localStorage (persists across login/logout)
      let storedId = localStorage.getItem("localUserId");
      if (!storedId) {
        // Create new localUserId only if one doesn't exist
        storedId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("localUserId", storedId);
      }
      setLocalUserId(storedId);
    } else if (user) {
      // When logged in, clear localUserId from state (but keep in localStorage for when you sign out)
      setLocalUserId(null);
    }
  }, [user]);

  const { transcript, isListening, startListening, stopListening, isSupported } =
    useVoiceInput();

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleSave = async () => {
    if (!input.trim() || isSaving) return;

    setIsSaving(true);
    setResponse("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          userId: user?.sub || null,
          localUserId: user ? null : localUserId 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.response);
        setInput("");
        // Trigger heatmap and stats refresh
        setRefreshTrigger(prev => prev + 1);
        // Play audio response
        playAudioResponse(data.response);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceClick = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const symptomSubmit = () => {
    if (!input.trim()) return;

    console.log("Submitted: ", input);
    setInput("");
  };

  return (
    <>
      <Navbar user={user} isLoading={isLoading} />

      <main className="page" style={{ paddingTop: 55 }}>
        <h1 className="main-title">Personal Health Log</h1>
        <p className="muted">The most efficient AI-powered tool for tracking symptoms & health.</p>

        <div className="textarea-wrapper">
          <textarea
            id="symptoms"
            placeholder={isListening ? "Listening..." : "Describe your symptoms..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                symptomSubmit();
              }
            }}
          />

          {isSupported && (
            <button
              type="button"
              className="voice-button"
              aria-label="Voice input"
              onClick={handleVoiceClick}
              style={isListening ? { background: "var(--accent)", color: "white" } : {}}
            >
              {isListening ? "⏹ Stop" : "🎤 Voice"}
            </button>
          )}
        </div>

        <button
          className="save-button"
          onClick={handleSave}
          disabled={isSaving || !input.trim()}
          style={{
            ...(isSaving || !input.trim() ? { opacity: 0.5, cursor: "not-allowed" } : {}),
            padding: "8px 16px",
            fontSize: "14px"
          }}
        >
          {isSaving ? "Saving..." : "Save entry"}
        </button>

        {response && (
          <div className="response-box">
            <p>{response}</p>
          </div>
        )}

        {/* Heatmap - horizontal and stretched */}
        <div style={{ marginBottom: "8px" }}>
          <p style={{ 
            fontSize: "12px", 
            color: "var(--foreground)", 
            opacity: 0.6, 
            margin: 0,
            textAlign: "center"
          }}>
            Last 90 days
          </p>
        </div>
        <HomeHeatmap refreshTrigger={refreshTrigger} userId={user?.sub || null} localUserId={user ? null : localUserId} />

        <div className="nav-links">
          <a href="/chat">💬 Chat with your data</a>
        </div>

        <p className="disclaimer">
          This tool is for tracking only. It is not medical advice. Please consult a
          healthcare professional for diagnosis and treatment.
        </p>

        <footer className="footer">CruzHacks 2026</footer>
      </main>
    </>
  );
}
