import axios from "axios";

const YT_BASE = "https://www.googleapis.com/youtube/v3";

function requireKey() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set in .env");
  return key;
}

/**
 * Search YouTube videos (travel-focused defaults).
 * @param {object} opts
 *  - q: query string (city/place/theme)
 *  - maxResults: 5..50
 *  - order: 'relevance' | 'viewCount' | 'date' | 'rating'
 *  - videoDuration: 'any' | 'short' | 'medium' | 'long'
 *  - regionCode: e.g., 'US', 'IN', etc.
 *  - publishedAfter: ISO date string
 */
export async function searchYouTube(opts = {}) {
  const key = requireKey();

  const {
    q,
    maxResults = 12,
    order = "relevance",
    videoDuration = "any",
    regionCode,
    publishedAfter,
  } = opts;

  if (!q) throw new Error("Missing q (query) for YouTube search");

  const params = {
    key,
    part: "snippet",
    type: "video",
    q,
    maxResults: Math.min(Math.max(Number(maxResults) || 12, 1), 50),
    order,
    videoDuration,
    // travel topicId (optional): /m/0747l = Travel (YouTube topics). Uncomment if you want stronger bias.
    // topicId: "/m/0747l",
  };

  if (regionCode) params.regionCode = regionCode;
  if (publishedAfter) params.publishedAfter = publishedAfter;

  const { data } = await axios.get(`${YT_BASE}/search`, { params });

  // Normalize
  const items = (data.items || []).map((it) => ({
    videoId: it.id?.videoId,
    title: it.snippet?.title,
    description: it.snippet?.description,
    channelId: it.snippet?.channelId,
    channelTitle: it.snippet?.channelTitle,
    publishedAt: it.snippet?.publishedAt,
    thumbnails: it.snippet?.thumbnails, // default, medium, high
    url: it.id?.videoId ? `https://www.youtube.com/watch?v=${it.id.videoId}` : null,
  }));

  return { items, pageInfo: data.pageInfo, nextPageToken: data.nextPageToken };
}

/** Optional: fetch more by page token */
export async function searchYouTubePage(opts = {}) {
  const key = requireKey();
  const {
    q,
    pageToken,
    maxResults = 12,
    order = "relevance",
    videoDuration = "any",
    regionCode,
    publishedAfter,
  } = opts;

  const params = {
    key,
    part: "snippet",
    type: "video",
    q,
    pageToken,
    maxResults,
    order,
    videoDuration,
  };
  if (regionCode) params.regionCode = regionCode;
  if (publishedAfter) params.publishedAfter = publishedAfter;

  const { data } = await axios.get(`${YT_BASE}/search`, { params });
  const items = (data.items || []).map((it) => ({
    videoId: it.id?.videoId,
    title: it.snippet?.title,
    description: it.snippet?.description,
    channelId: it.snippet?.channelId,
    channelTitle: it.snippet?.channelTitle,
    publishedAt: it.snippet?.publishedAt,
    thumbnails: it.snippet?.thumbnails,
    url: it.id?.videoId ? `https://www.youtube.com/watch?v=${it.id.videoId}` : null,
  }));
  return { items, pageInfo: data.pageInfo, nextPageToken: data.nextPageToken };
}
