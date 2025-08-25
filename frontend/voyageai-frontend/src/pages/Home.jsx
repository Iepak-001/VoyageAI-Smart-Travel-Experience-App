import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

export default function Home() {
  const [destination, setDestination] = useState("New Delhi, India");
  const [days, setDays] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [plan, setPlan] = useState(null);        // { days: [...], summary, places?: [...] }
  const [videos, setVideos] = useState([]);      // youtube search results
  const [reviews, setReviews] = useState([]);    // recent reviews for selected place
  const [sentiment, setSentiment] = useState(null);
  const [route, setRoute] = useState(null);      // { order, totalDuration, totalDistance }

  // --- Review form state ---
  const [reviewPlace, setReviewPlace] = useState("");   // selected place name (from dropdown or custom)
  const [customPlace, setCustomPlace] = useState("");   // when "Other…" chosen
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  // Places from itinerary (for dropdown)
  const itineraryPlaces = useMemo(() => {
    const p = plan?.places?.length ? plan.places : extractPlaces(plan);
    return p.slice(0, 15);
  }, [plan]);

  // Keep review place in sync with newly generated itinerary
  useEffect(() => {
    if (itineraryPlaces.length && !reviewPlace) {
      setReviewPlace(itineraryPlaces[0]);
    }
  }, [itineraryPlaces]); // eslint-disable-line

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setPlan(null); setVideos([]); setReviews([]); setSentiment(null); setRoute(null);
    setReviewMsg("");

    try {
      // 1) Itinerary (Gemini)
      const { data: itinResp } = await api.post("/itinerary/generate", {
        region: destination,
        days: Number(days)
      });
      const planData = itinResp?.data || itinResp;
      setPlan(planData);

      const places = planData?.places?.length ? planData.places.slice(0, 10) : extractPlaces(planData);

      // 2) YouTube
      const { data: ytResp } = await api.get("/youtube/search", {
        params: { q: `${destination} travel`, maxResults: 9 }
      });
      setVideos(ytResp?.data?.items || []);

      // 3) Reviews & sentiment for destination (first matching attraction)
      const { data: attResp } = await api.get("/attractions", { params: { q: destination, limit: 1 } });
      const first = attResp?.data?.items?.[0];
      if (first?._id) {
        await loadReviewsAndSentimentByAttractionId(first._id);
      }

      // 4) Route optimizer
      if (places.length >= 2) {
        const { data: optResp } = await api.post("/itinerary/optimize", { places });
        setRoute(optResp?.data || null);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Load reviews+sentiment for a place name (find or create attraction)
  const loadReviewsForPlaceName = async (placeName) => {
    if (!placeName?.trim()) return;
    const attractionId = await ensureAttraction(placeName, destination);
    if (attractionId) {
      await loadReviewsAndSentimentByAttractionId(attractionId);
    }
  };

  async function loadReviewsAndSentimentByAttractionId(attractionId) {
    const [revRes, sentRes] = await Promise.all([
      api.get("/reviews", { params: { attractionId, limit: 6 } }),
      api.get(`/reviews/attraction/${attractionId}/sentiment`)
    ]);
    setReviews(revRes?.data?.data?.reviews || []);
    setSentiment(sentRes?.data?.data?.sentimentSummary || null);
  }

  // Ensure an attraction exists in DB; if not, create it, then return its _id
  async function ensureAttraction(name, location) {
    try {
      const { data } = await api.get("/attractions", { params: { q: name, limit: 1 } });
      const match = data?.data?.items?.[0];
      if (match) return match._id;
      const createRes = await api.post("/attractions", { name, location });
      return createRes?.data?.data?.attraction?._id;
    } catch {
      return null;
    }
  }

  // Submit review handler
  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMsg("");
    setReviewBusy(true);
    try {
      const chosen = reviewPlace === "__other__" ? customPlace : reviewPlace;
      if (!chosen?.trim()) throw new Error("Please select or enter a place.");

      const attractionId = await ensureAttraction(chosen, destination);
      if (!attractionId) throw new Error("Could not find or create the place.");

      await api.post("/reviews", {
        attractionId,
        rating: Number(reviewRating),
        text: reviewText?.trim(),
        author: reviewAuthor?.trim() || "Anonymous"
      });

      // reset form (keep place)
      setReviewText("");
      setReviewRating(5);
      setReviewAuthor("");
      setReviewMsg("✅ Review submitted!");

      // refresh reviews & sentiment
      await loadReviewsAndSentimentByAttractionId(attractionId);
    } catch (e2) {
      setReviewMsg(`❌ ${e2.message || "Failed to submit review"}`);
    } finally {
      setReviewBusy(false);
    }
  };

  // Change selected review place → refresh displayed reviews
  useEffect(() => {
    const chosen = reviewPlace === "__other__" ? customPlace : reviewPlace;
    if (chosen?.trim()) {
      loadReviewsForPlaceName(chosen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewPlace]);

  useEffect(() => {
    if (reviewPlace === "__other__" && customPlace.trim()) {
      loadReviewsForPlaceName(customPlace.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customPlace]);

  return (
    <section className="space-y-10 text-gray-200">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0b1220] via-[#0d1527] to-[#0b0f17] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Plan smarter with VoyageAI
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Itinerary • Videos • Reviews • Optimized routes
          </p>

          {/* CONTROLS */}
          <div className="mt-6 grid sm:grid-cols-[2fr_1fr_auto] gap-3">
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination (e.g., New Delhi, India)"
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              onClick={handleGenerate}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 transition"
            >
              {loading ? "Working…" : "Generate"}
            </button>
          </div>

          {error && <p className="mt-3 text-rose-400">{error}</p>}
        </div>
      </header>

      {/* ITINERARY CARDS */}
      {loading && <SkeletonGrid />}
      {!loading && plan?.days?.length > 0 && (
        <Section title="Itinerary" subtitle={plan?.summary}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.days.map((d) => (
              <GlassCard key={d.day}>
                <div className="text-xs text-gray-400">Day {d.day}</div>
                <h3 className="mt-1 font-semibold text-white">{d.title || `Day ${d.day}`}</h3>
                <ul className="mt-3 space-y-1 text-sm text-gray-300">
                  {(d.schedule || []).map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="shrink-0 tabular-nums text-gray-400 w-14">{s.time}</span>
                      <div>
                        <span className="font-medium text-white">{s.place}</span>
                        {s.activity ? <span className="text-gray-400"> — {s.activity}</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </Section>
      )}

      {/* VISITING SEQUENCE */}
      {!loading && route?.order?.length > 0 && (
        <Section title="Visiting sequence" subtitle="Optimized by distance & travel time">
          <GlassCard compact>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {route.order.map((p, i) => <li key={i}>{p}</li>)}
            </ol>
            <div className="mt-2 text-xs text-gray-400">
              Total time: {(route.totalDuration/3600).toFixed(2)} h · Distance: {(route.totalDistance/1000).toFixed(1)} km
            </div>
          </GlassCard>
        </Section>
      )}

      {/* VIDEOS */}
      {!loading && videos.length > 0 && (
        <Section title="Top videos" subtitle={`Travel videos for ${destination}`}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <a
                key={v.videoId}
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                {v.thumbnails?.high?.url && (
                  <img
                    src={v.thumbnails.high.url}
                    alt={v.title}
                    className="w-full aspect-video object-cover opacity-95 group-hover:opacity-100 transition"
                  />
                )}
                <div className="p-3">
                  <div className="line-clamp-2 font-medium text-white group-hover:text-indigo-300">
                    {v.title}
                  </div>
                  <div className="text-xs text-gray-400">{v.channelTitle}</div>
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* ADD A REVIEW */}
      <Section title="Add a review" subtitle="Share your experience and help other travelers">
        <GlassCard>
          <form onSubmit={submitReview} className="grid gap-3">
            {/* Place selector */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Place</label>
                <select
                  className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  value={reviewPlace}
                  onChange={(e) => setReviewPlace(e.target.value)}
                >
                  {itineraryPlaces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="__other__">Other…</option>
                </select>
              </div>
              {reviewPlace === "__other__" && (
                <div>
                  <label className="text-xs text-gray-400">Custom place name</label>
                  <input
                    className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                    value={customPlace}
                    onChange={(e) => setCustomPlace(e.target.value)}
                    placeholder="e.g., Lotus Temple"
                  />
                </div>
              )}
            </div>

            {/* Rating + Author */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400">Rating</label>
                <select
                  className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                >
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Your name (optional)</label>
                <input
                  className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  placeholder="e.g., Aditi"
                />
              </div>
            </div>

            {/* Text */}
            <div>
              <label className="text-xs text-gray-400">Your review</label>
              <textarea
                required
                className="mt-1 w-full rounded-xl bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500 h-28"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like or dislike?"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={reviewBusy}
                className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 transition"
              >
                {reviewBusy ? "Submitting…" : "Submit review"}
              </button>
              {reviewMsg && <span className="text-sm">{reviewMsg}</span>}
            </div>
          </form>
        </GlassCard>
      </Section>

      {/* REVIEWS & SENTIMENT (of the selected/custom place) */}
      {(reviews.length > 0 || sentiment) && (
        <Section title="Reviews & sentiment" subtitle="What travelers are saying for the selected place">
          {sentiment && (
            <GlassCard compact>
              <div className="text-sm">
                Avg sentiment: <span className="font-semibold text-white">{Number(sentiment.avgScore).toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-400">
                Positive: {sentiment.positive || 0} · Negative: {sentiment.negative || 0}
                {sentiment.updatedAt && <> · Updated {new Date(sentiment.updatedAt).toLocaleString()}</>}
              </div>
            </GlassCard>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {reviews.map((r) => (
              <GlassCard key={r._id}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{r.author || "Traveler"}</span>
                  <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-300">{r.text}</p>
                {r.sentiment?.label && (
                  <div className="mt-2 text-xs text-gray-400">
                    Sentiment: {r.sentiment.label} ({Math.round((r.sentiment.score || 0) * 100)}%)
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </Section>
      )}

      {!loading && !plan?.days && !error && (
        <p className="text-center text-gray-500">Enter a destination and days, then hit Generate.</p>
      )}
    </section>
  );
}

/* ----------------- UI Helpers (dark only) ----------------- */

function Section({ title, subtitle, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function GlassCard({ children, compact = false }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[2px] shadow-[0_8px_24px_rgba(0,0,0,0.25)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      {children}
    </div>
  );
}

function SkeletonGrid() {
  const Box = () => <div className="h-40 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <Box key={i} />)}
    </div>
  );
}

/* ----------------- Data helpers ----------------- */
function extractPlaces(planData) {
  if (!planData?.days) return [];
  const set = new Set();
  for (const d of planData.days) {
    for (const s of d.schedule || []) {
      if (s.place) set.add(s.place);
    }
  }
  return Array.from(set).slice(0, 10);
}
