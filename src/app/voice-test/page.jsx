"use client";

import { useState } from "react";
import { useVoiceInput } from "../../hooks/useVoiceInput";

export default function VoiceTestPage() {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
    error,
    isSupported,
  } = useVoiceInput();

  const [savedText, setSavedText] = useState("");

  const handleSave = () => {
    if (transcript.trim()) {
      setSavedText(transcript);
      // This is where you'd send to Gemini API later
      console.log("Ready to send to Gemini:", transcript);
    }
  };

  // Sample inputs for demo fallback
  const sampleInputs = [
    "My head hurts really bad this morning",
    "Mild back pain after sitting too long",
    "Feeling nauseous, probably from dinner last night",
    "Worst migraine ever, can barely see",
  ];

  const useSampleInput = (sample) => {
    clearTranscript();
    // Manually set via a workaround since transcript is controlled by speech
    setSavedText(sample);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">
          Voice Input Test
        </h1>
        <p className="text-slate-600 mb-8">
          Test the voice-to-text functionality for symptom logging.
        </p>

        {/* Status */}
        <div className="mb-6">
          {!isSupported && (
            <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg">
              ⚠️ Speech recognition not supported. Use sample inputs below.
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Voice Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              className={`
                flex items-center justify-center w-16 h-16 rounded-full 
                transition-all duration-200 
                ${isListening 
                  ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                  : "bg-green-500 hover:bg-green-600"
                }
                ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}
                text-white
              `}
            >
              {isListening ? (
                <span className="text-2xl">⏹</span>
              ) : (
                <span className="text-2xl">🎤</span>
              )}
            </button>
            <div>
              <p className="font-medium text-slate-900">
                {isListening ? "Listening..." : "Tap to speak"}
              </p>
              <p className="text-sm text-slate-500">
                {isListening 
                  ? "Speak your symptoms clearly" 
                  : "Describe how you're feeling"
                }
              </p>
            </div>
          </div>

          {/* Transcript Display */}
          <div className="bg-slate-50 rounded-lg p-4 min-h-[80px] border border-slate-200">
            {transcript ? (
              <p className="text-slate-900">{transcript}</p>
            ) : (
              <p className="text-slate-400 italic">
                Your speech will appear here...
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={!transcript.trim()}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${transcript.trim()
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }
              `}
            >
              Save & Parse
            </button>
            <button
              onClick={clearTranscript}
              className="px-4 py-2 rounded-lg font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Sample Inputs (Demo Fallback) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-3">
            Demo Mode: Sample Inputs
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Click any sample to use it (for demo reliability)
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleInputs.map((sample, i) => (
              <button
                key={i}
                onClick={() => useSampleInput(sample)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors text-left"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Saved Text Display */}
        {savedText && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-green-800 mb-2">
              Ready to send to Gemini:
            </h3>
            <p className="text-green-900 font-mono">{savedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
