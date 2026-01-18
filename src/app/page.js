"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ThemeToggle from "./components/ThemeToggle";
import { useVoiceInput } from "@/hooks/useVoiceInput";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
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
        setInput(""); // Clear input after successful save
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
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
        <ThemeToggle />
      </header>

      <div className="logo-container">
        <Image
          src="/logo.png"
          alt="Personal Health Log Icon"
          width={90}
          height={90}
        />
      </div>

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
          disabled={isLoading || !input.trim()}
          style={isLoading || !input.trim() ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          {isLoading ? "Saving..." : "Save entry"}
        </button>
      </div>

      {/* AI Response */}
      {response && (
        <div className="response-box">
          <p>{response}</p>
        </div>
      )}

      {/* Navigation links */}
      <div className="nav-links">
        <a href="/chat">💬 Chat with your data</a>
      </div>

      {/* Disclaimer */}
      <p className="disclaimer">
        This tool is for tracking only. It is not medical advice. Please consult a healthcare professional for diagnosis and treatment.
      </p>
    </main>
  );
}
