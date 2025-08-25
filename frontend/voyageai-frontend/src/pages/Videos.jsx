import { useState } from "react";
import api from "../lib/api";

export default function Videos() {
  const [q, setQ] = useState("paris travel");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setErr(""); setLoading(true); setItems([]);
    try {
      const { data } = await api.get("/youtube/search", { params: { q, maxResults: 9 } });
      setItems(data.data.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Travel Videos</h2>
      <div className="flex gap-2 mb-4">
        <input className="border rounded px-3 py-2 flex-1" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button onClick={search} className="border rounded px-4 py-2 hover:bg-gray-50">Search</button>
      </div>
      {err && <p className="text-red-600">{err}</p>}
      {loading ? <p>Loading…</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(v => (
            <a key={v.videoId} href={v.url} target="_blank" rel="noreferrer" className="border rounded-xl overflow-hidden hover:shadow-md transition">
              {v.thumbnails?.high?.url && (
                <img src={v.thumbnails.high.url} alt={v.title} className="w-full aspect-video object-cover" />
              )}
              <div className="p-3">
                <div className="font-semibold line-clamp-2">{v.title}</div>
                <div className="text-xs text-gray-500">{v.channelTitle}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
