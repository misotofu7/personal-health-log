import Image from "next/image";

export default function Home() {
  return (
    <main>
      <header>
        <h1 className="main-title">Personal Health Log</h1>
      </header>

      <p className="center-text muted">Log symptoms and view them on a calendar.</p>

      <div className="input-wrapper">
        <textarea
          placeholder="Describe your symptoms."
          rows={4}
        />
      </div>
    </main>
  );
}
