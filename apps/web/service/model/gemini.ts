import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import fs from "node:fs";
import mime from "mime-types";

const apiKey: string = process.env.GEMINI_API_KEY || "";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseModalities: [],
  responseMimeType: "text/plain",
};

async function generateResponse(input: string): Promise<string> {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(input);

    const candidates = result.response.candidates || [];
    let outputText = result.response.text() || "";

    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
      const contentParts = candidates[candidateIndex]?.content?.parts || [];

      for (let partIndex = 0; partIndex < contentParts.length; partIndex++) {
        const part = contentParts[partIndex];

        if (part && part.inlineData) {
          try {
            const extension = mime.extension(part.inlineData.mimeType);
            if (!extension) continue;
            const filename = `output_${candidateIndex}_${partIndex}.${extension}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, "base64"));
            console.log(`Output written to: ${filename}`);
          } catch (err) {
            console.error("Error writing file:", err);
          }
        }
      }
    }
    return outputText;
  } catch (error) {
    console.error("AI Error:", error);
    return "###सीताराम!, AI service unavailable, please try again later. राधे राधे श्याम मिलादे###";
  }
}

export { generateResponse };
