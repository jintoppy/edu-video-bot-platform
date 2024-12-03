import axios from "axios";

const textToSpeechDeepGram = async (text: string) => {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.deepgram.com/v1/speak?sample_rate=16000&container=none&encoding=linear16&model=aura-luna-en",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY}`,
      },
      data: { text },
      responseType: "arraybuffer",
    });

    // Convert ArrayBuffer to Base64
    // const buffer = Buffer.from(response.data);
    // const base64Audio = buffer.toString("base64");

    return {
      success: true,
      audioData: response.data,
    };
  } catch (error) {
    console.error("Deepgram API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const textToSpeech = async (txt: string) => {
  try {
    if (!txt || typeof txt !== "string") {
      throw new Error("Invalid text input");
    }

    return await textToSpeechDeepGram(txt);
  } catch (error) {
    console.error("Error in textToSpeech:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
