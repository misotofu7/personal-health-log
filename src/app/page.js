import Image from "next/image";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <main className="page">
      <header className="top-bar">
        <ThemeToggle />
      </header>

      <h1 className="main-title">Personal Health Log</h1>

      <div className="card">
        <p className="muted">Log symptoms and view them on a calendar.</p>

        <div className="textarea-wrapper">
          <textarea
            id="symptoms"
            placeholder="Describe your symptoms..."
            rows={4}
          />
          <button
            type="button"
            className="voice-button"
            aria-label="Voice input"
          >
            🎤 Voice
          </button>
        </div>

        <button className="save-button">Save entry</button>
      </div>
    </main>
  );
}