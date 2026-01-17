"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useVoiceInput - A hook for browser speech recognition
 * 
 * Returns:
 * - transcript: the recognized text
 * - isListening: whether the mic is active
 * - startListening: function to start recognition
 * - stopListening: function to stop recognition
 * - error: any error message
 * - isSupported: whether the browser supports speech recognition
 */
export function useVoiceInput() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);

  // Initialize speech recognition on mount
  useEffect(() => {
    // Check browser support
    const SpeechRecognition = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("Speech recognition not supported in this browser");
      return;
    }

    setIsSupported(true);
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after one phrase
    recognition.interimResults = true; // Show results as user speaks
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Show interim results while speaking, final when done
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not available");
      return;
    }

    setError(null);
    setTranscript("");
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Handle case where recognition is already started
      setError("Could not start speech recognition");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
    error,
    isSupported,
  };
}
