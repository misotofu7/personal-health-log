"use client";

import { useState, useEffect } from "react";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { Navbar } from "./components/Navbar";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { user, isLoading } = useUser();

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
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <>
      <Navbar user={user} isLoading={isLoading} />

      <main className="page" style={{ paddingTop: 90 }}>
        <h1 className="main-title">Personal Health Log</h1>
        <p className="muted">Log symptoms and view them on a calendar.</p>

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

        {response && (
          <div className="response-box">
            <p>{response}</p>
          </div>
        )}

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
