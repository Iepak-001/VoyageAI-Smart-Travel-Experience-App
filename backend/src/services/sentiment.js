import { pipeline } from "@xenova/transformers";

let analyser = null;

async function getAnalyser() {
  if (!analyser) {
    analyser = await pipeline(
      "sentiment-analysis",
      // Xenova’s mirror works best with this identifier:
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
  }
  return analyser;
}

export async function analyzeSentiment(text) {
  const pipe = await getAnalyser();
  const out = await pipe(text);
  // out: [{label: 'POSITIVE'|'NEGATIVE', score: 0..1}]
  const { label, score } = out[0];
  return { label, score };
}

/**
 * Compute aggregate sentiment for an attraction from its reviews.
 * avgScore maps POSITIVE=+1 * score, NEGATIVE=-1 * score, then averages.
 */
export function summarizeSentiments(reviews) {
  let positive = 0, negative = 0, neutral = 0, weightedSum = 0;

  for (const r of reviews) {
    if (!r.sentiment?.label) continue;
    const label = r.sentiment.label;
    const score = r.sentiment.score ?? 0;
    if (label === "POSITIVE") {
      positive++;
      weightedSum += score; // +score
    } else if (label === "NEGATIVE") {
      negative++;
      weightedSum -= score; // -score
    } else {
      neutral++;
    }
  }
  const total = positive + negative + neutral || 1;
  const avgScore = weightedSum / total;

  return {
    positive,
    negative,
    neutral,
    avgScore,
    updatedAt: new Date()
  };
}
