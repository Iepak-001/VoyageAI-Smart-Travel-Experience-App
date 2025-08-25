import { searchYouTube, searchYouTubePage } from "../services/youtube.js";

export const youtubeSearch = async (req, res) => {
  try {
    const { q, maxResults, order, videoDuration, regionCode, publishedAfter, pageToken } = req.query;

    const data = pageToken
      ? await searchYouTubePage({ q, pageToken, maxResults, order, videoDuration, regionCode, publishedAfter })
      : await searchYouTube({ q, maxResults, order, videoDuration, regionCode, publishedAfter });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("YouTube search error:", err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
};
