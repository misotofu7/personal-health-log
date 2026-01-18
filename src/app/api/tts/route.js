export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use Rachel voice (calm, professional) - Voice ID: 21m00Tcm4TlvDq8ikWAM
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
    const model = "eleven_turbo_v2"; // Fast model for better UX

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      return new Response(
        JSON.stringify({ error: `ElevenLabs API error: ${response.status}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the audio stream
    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
