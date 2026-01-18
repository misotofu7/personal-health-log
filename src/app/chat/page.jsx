"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { Navbar } from "../components/Navbar";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceInput();

  // Auto-fill input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.error}` },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <Navbar/>
      {/* Header */}
      <header className="px-6 py-3 flex items-center gap-4" style={{ background: "var(--textbox)", borderBottom: "1px solid var(--border)" }}>
        <a 
          href="/" 
          className="hover:opacity-70 transition-opacity"
          title="Back to Home"
        >
          <Image
            src="/logo.png"
            alt="Home"
            width={40}
            height={40}
          />
        </a>
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Health Assistant
          </h1>
          <p className="text-xs" style={{ color: "var(--foreground)", opacity: 0.6 }}>
            Log symptoms, ask about patterns
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: "var(--background)" }}>
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🩺</div>
            <h2 className="text-lg font-medium mb-2" style={{ color: "var(--foreground)" }}>
              Welcome to BioLog
            </h2>
            <p className="max-w-md mx-auto mb-6" style={{ color: "var(--foreground)", opacity: 0.7 }}>
              I can help you track symptoms and find patterns in your health data.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "I have a bad headache",
                "Log mild back pain",
                "What triggers my headaches?",
                "Show my patterns",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ 
                    background: "var(--textbox)", 
                    border: "1px solid var(--border)",
                    color: "var(--foreground)"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "var(--accent-light)"}
                  onMouseLeave={(e) => e.target.style.background = "var(--textbox)"}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "rounded-br-md"
                  : "rounded-bl-md"
              }`}
              style={{
                background: msg.role === "user" 
                  ? "var(--accent)" 
                  : "var(--textbox)",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                color: msg.role === "user" 
                  ? "white" 
                  : "var(--foreground)"
              }}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: "var(--textbox)", border: "1px solid var(--border)" }}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--foreground)", opacity: 0.5 }} />
                <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.1s]" style={{ background: "var(--foreground)", opacity: 0.5 }} />
                <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]" style={{ background: "var(--foreground)", opacity: 0.5 }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4" style={{ background: "var(--textbox)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          {/* Voice Button */}
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isListening ? "#ef4444" : "var(--voice-bg)",
                color: isListening ? "white" : "var(--foreground)"
              }}
            >
              {isListening ? "⏹" : "🎤"}
            </button>
          )}

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Describe symptoms or ask a question..."}
              rows={1}
              className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)"
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{
              background: input.trim() && !isLoading ? "var(--accent)" : "var(--voice-bg)",
              color: input.trim() && !isLoading ? "white" : "var(--foreground)",
              opacity: input.trim() && !isLoading ? 1 : 0.5,
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed"
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
