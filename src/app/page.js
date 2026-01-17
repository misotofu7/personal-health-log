import Image from "next/image";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <main className="page">
      <header className="top-bar">
        <ThemeToggle />
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
    </main>
  );
}