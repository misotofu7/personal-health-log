"use client";

import Image from "next/image";
import ThemeToggle from "./components/ThemeToggle";
import { useUser } from "@auth0/nextjs-auth0";

export default function Home() {
  const { user, isLoading } = useUser();

  return (
    <main className="page">
      <header className="top-bar">
        <div className="brand">
          <Image
            src="/logo.png"
            alt="Personal Health Log"
            width={70}
            height={70}
          />
        </div>

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