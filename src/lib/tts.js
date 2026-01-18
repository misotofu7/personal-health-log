/**
 * Check if response contains urgent/important alerts
 * @param {string} text - The text to check
 * @returns {boolean} - True if urgent
 */
function isUrgentResponse(text) {
  const urgentKeywords = [
    "PROTOCOL ACTIVATED",
    "⚠️",
    "🚨",
    "urgent",
    "action required",
    "TAKE_LASIX",
    "MONITOR_CLOSELY",
    "weight gain",
    "severity 4",
    "severity 3",
    "immediately",
    "emergency",
  ];
  
  const upperText = text.toUpperCase();
  return urgentKeywords.some(keyword => upperText.includes(keyword.toUpperCase()));
}

/**
 * Play audio response using ElevenLabs TTS
 * Only plays for urgent alerts unless TTS is enabled in settings
 * @param {string} text - The text to convert to speech
 * @param {boolean} forcePlay - Force playback even if not urgent (default: false)
 * @returns {Promise<void>}
 */
export async function playAudioResponse(text, forcePlay = false) {
  try {
    // Check if TTS is enabled in localStorage (default: only urgent alerts)
    const ttsSetting = typeof window !== 'undefined' 
      ? localStorage.getItem('ttsEnabled') 
      : null;
    
    // Only play if:
    // 1. User explicitly enabled TTS for all responses, OR
    // 2. Response is urgent/important, OR
    // 3. forcePlay is true
    const shouldPlay = forcePlay || 
                      ttsSetting === 'all' || 
                      (ttsSetting !== 'off' && isUrgentResponse(text));
    
    if (!shouldPlay) {
      return; // Silent return - TTS is optional
    }

    // Clean text - remove markdown formatting, emojis, etc. for better TTS
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
      .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
      .replace(/`(.*?)`/g, "$1") // Remove code markdown
      .replace(/[⚠️🚨]/g, "") // Remove emojis
      .replace(/\n+/g, ". ") // Replace newlines with periods
      .trim();

    if (!cleanText) {
      console.warn("No text to speak");
      return;
    }

    // Call the TTS API
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: cleanText }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("TTS API error:", error);
      return;
    }

    // Create audio blob and play it
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Clean up URL after playback
    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(audioUrl);
    });

    audio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e);
      URL.revokeObjectURL(audioUrl);
    });

    await audio.play();
  } catch (error) {
    console.error("Error playing audio:", error);
    // Fail silently - TTS is a nice-to-have feature
  }
}
