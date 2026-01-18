"use client";

import Image from "next/image";
import ThemeToggle from "./components/ThemeToggle";
import { useUser } from "@auth0/nextjs-auth0";

export default function Home() {
  const { user, isLoading } = useUser();

  return (
    <main className="page">
      <header className="top-bar">
        <ThemeToggle />
        <a href="/auth/login">Log in</a>
        <a href="/auth/logout">Log out</a>
      </header>

      <h1 className="main-title">Personal Health Log</h1>
      <p className="muted">Log symptoms and view them on a calendar.</p>

      <div>
        <div className="textarea-wrapper">
          <textarea
            id="symptoms"
            placeholder="Describe your symptoms..."
          />
          <button
            type="button"
            className="voice-button"
            aria-label="Voice input"
          >
            🎤  Voice
          </button>
        </div>

        <button className="save-button">Save entry</button>
      </div>

      <footer className="footer">CruzHacks 2026</footer>
    </main>
  );
}