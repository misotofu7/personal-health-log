"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ThemeToggle from "./components/ThemeToggle";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { Navbar } from "./components/Navbar";
import { useUser } from "@auth0/nextjs-auth0";
import { HomeHeatmap } from "./components/HomeHeatmap";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, isLoading } = useUser();

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceInput();

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSave = async () => {
    if (!input.trim() || isSaving) return;

    setIsSaving(true);
    setResponse("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.response);
        setInput("");
        // Trigger heatmap refresh
        setRefreshTrigger(prev => prev + 1);
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
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <main className="page">
      
      <header className="top-bar">
        <div className="nav-right">
          {/* show who is logged in */}
          {!isLoading && user && (
            <span className="user-pill">
              Hi, {user.name || user.email}
            </span>
          )}

          {/* show login only when logged out */}
          {!isLoading && !user && (
            <a href="/auth/login" className="auth-button login">
              Log in
            </a>
          )}

          {/* show logout only when logged in */}
          {!isLoading && user && (
            <a href="/auth/logout" className="auth-button logout">
              Log out
            </a>
          )}

          <ThemeToggle />
        </div>
        <Navbar/>
      </header>

      <h1 className="main-title">Personal Health Log</h1>
      <p className="muted">Log symptoms and view them on a calendar.</p>

      <div>
        <div className="textarea-wrapper">
          <textarea
            id="symptoms"
            placeholder={isListening ? "Listening..." : "Describe your symptoms..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
          style={isSaving || !input.trim() ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          {isSaving ? "Saving..." : "Save entry"}
        </button>
      </div>

      {/* AI Response */}
      {response && (
        <div className="response-box">
          <p>{response}</p>
        </div>
      )}

      {/* Heatmap */}
      <HomeHeatmap refreshTrigger={refreshTrigger} />

      {/* Navigation links */}
      <div className="nav-links">
        <a href="/chat">💬 Chat with your data</a>
      </div>

      {/* Disclaimer */}
      <p className="disclaimer">
        This tool is for tracking only. It is not medical advice. Please consult a healthcare professional for diagnosis and treatment.
      </p>

      <footer className="footer">CruzHacks 2026</footer>
    </main>
  );
}
