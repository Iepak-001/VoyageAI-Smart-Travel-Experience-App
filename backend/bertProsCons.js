const { pipeline } = require("@xenova/transformers");
const sentenceSplitter = require("sentence-splitter");

let classifier = null;

async function initClassifier() {
  if (!classifier) {
    classifier = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
  }
}

function splitIntoSentences(text) {
  const doc = sentenceSplitter.split(text);
  return doc
    .filter((e) => e.type === "Sentence")
    .map((s) => s.raw.trim())
    .filter(Boolean);
}

async function extractProsConsFromReviews(reviews) {
  await initClassifier();

  let pros = [];
  let cons = [];

  for (const review of reviews) {
    const sentences = splitIntoSentences(review);

    for (const sentence of sentences) {
      try {
        const result = await classifier(sentence);
        if (!result || !result[0]) continue;

        const sentiment = result[0].label.toLowerCase();

        if (sentiment === "positive" && !pros.includes(sentence)) {
          pros.push(sentence);
        } else if (sentiment === "negative" && !cons.includes(sentence)) {
          cons.push(sentence);
        }
      } catch (err) {
        console.error("Error classifying sentence:", err);
      }
    }
  }

  // Limit number of phrases for UX
  pros = pros.slice(0, 10);
  cons = cons.slice(0, 10);

  return { pros, cons };
}

module.exports = { extractProsConsFromReviews };
