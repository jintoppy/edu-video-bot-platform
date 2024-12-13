import Pusher from "pusher";
import axios from "axios";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Function to convert text to speech using Deepgram
export async function generateSpeech(text: string, sessionId: string) {
  if (!text.trim()) return;

  try {
    const response = await axios({
      method: "POST",
      url: `https://api.deepgram.com/v1/speak?model=${process.env.DEEPGRAM_VOICE_ID}&encoding=linear16&sample_rate=16000`,
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ text }),
      responseType: "arraybuffer",
    });

    if (response.headers["content-type"]?.includes("application/json")) {
      console.error(
        "Deepgram TTS API error:",
        Buffer.from(response.data).toString("utf8")
      );
      return;
    }

    const audioData = new Uint8Array(response.data);
    const chunkSize = 2048;
    const CHUNKS_TO_SKIP = 1;

    // Split audio into chunks
    const chunks = [];
    for (let i = 0; i < audioData.length; i += chunkSize) {
      chunks.push(
        audioData.slice(i, Math.min(i + chunkSize, audioData.length))
      );
    }

    // Send chunks through Pusher
    for (let i = CHUNKS_TO_SKIP; i < chunks.length; i++) {
      await pusher.trigger(`chat-${sessionId}`, "audio-chunk", {
        chunk: Array.from(chunks[i]), // Convert Uint8Array to regular array for Pusher
        chunkIndex: i,
        totalChunks: chunks.length,
      });
      // Small delay between chunks for smooth playback
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  } catch (error) {
    console.error("Error in speech generation:", error);
  }
}
