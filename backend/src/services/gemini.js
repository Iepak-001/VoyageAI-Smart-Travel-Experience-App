import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from "jsonrepair";

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

function coerceJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const raw = fenced ? fenced[1] : text;
  try { return JSON.parse(raw); } catch {}
  try { return JSON.parse(jsonrepair(raw)); } catch {}
  const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(jsonrepair(raw.slice(start, end + 1))); } catch {}
  }
  return null;
}

function extractPlaces(plan) {
  if (!plan?.days) return [];
  const s = new Set();
  for (const d of plan.days) for (const it of (d.schedule || [])) if (it.place) s.add(it.place);
  return Array.from(s).slice(0, 10);
}

export async function generateItinerary(attractions = [], days = 3, region = "") {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const hasProvided = Array.isArray(attractions) && attractions.length > 0;

  const prompt = `
You are a travel planner. Output **ONLY valid JSON** (no code fences, no prose).

If a list of attractions is provided, use it. If not, first choose the most iconic, logically grouped attractions for "${region}" (walkable clusters preferred), then create the plan.

JSON schema:
{
  "days": [
    {
      "day": 1,
      "title": "string",
      "schedule": [
        { "time": "HH:MM", "place": "string", "activity": "string" }
      ]
    }
  ],
  "summary": "string"
}

Destination: "${region}"
Days: ${days}
${hasProvided ? `Attractions:\n${attractions.map((a,i)=>`${i+1}. ${a}`).join("\n")}` : `Attractions: (you choose them for this destination)`}
Remember: respond with JSON only, strictly matching the schema.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = coerceJSON(text);

  if (parsed?.days?.length) {
    return { ...parsed, places: extractPlaces(parsed) };
  }
  return { raw: text, places: [] };
}
