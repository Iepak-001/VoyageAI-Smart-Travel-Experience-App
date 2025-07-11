// api/geminiApi.ts

// The base URL for the Gemini API
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

/**
 * Calls the Gemini API to generate content based on a given prompt.
 * @param prompt The text prompt to send to the Gemini model.
 * @returns A promise that resolves with the generated text.
 * @throws Error if the API call fails or returns an unexpected response.
 */
export const generateGeminiContent = async (prompt: string): Promise<string> => {
  try {
    // API key is provided by the Canvas environment at runtime
    const apiKey = "AIzaSyAbwp6MIl7f4dlNhxkUMF_lWo8la1ThXJI"; // Leave this empty, Canvas will inject the key
    const apiUrl = `${GEMINI_API_URL}${apiKey}`;

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error Response:", errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();

    // Check if the response structure is as expected
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.warn("Gemini API returned an unexpected structure:", result);
      throw new Error("No content generated or unexpected API response structure.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

/**
 * Calls the Gemini API to generate structured content (JSON) based on a given prompt and schema.
 * This is useful for extracting specific data like pros/cons in a structured way.
 * @param prompt The text prompt to send to the Gemini model.
 * @param responseSchema The JSON schema defining the desired output structure.
 * @returns A promise that resolves with the parsed JSON object.
 * @throws Error if the API call fails or returns an unexpected response.
 */
export const generateStructuredGeminiContent = async (prompt: string, responseSchema: any): Promise<any> => {
  try {
    const apiKey = ""; // Leave this empty, Canvas will inject the key
    const apiUrl = `${GEMINI_API_URL}${apiKey}`;

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Structured Error Response:", errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      try {
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Failed to parse JSON response from Gemini:", jsonString, parseError);
        throw new Error("Received invalid JSON from AI. Please try again.");
      }
    } else {
      console.warn("Gemini API returned an unexpected structure for structured content:", result);
      throw new Error("No structured content generated or unexpected API response structure.");
    }
  } catch (error) {
    console.error("Error calling structured Gemini API:", error);
    throw error;
  }
};

