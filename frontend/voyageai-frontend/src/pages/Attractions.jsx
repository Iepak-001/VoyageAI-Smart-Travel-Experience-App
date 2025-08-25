import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Attractions() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/attractions", { params: q ? { q } : {} });
      setItems(data.data.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/attractions", { name, location });
      setName(""); setLocation("");
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Attractions</h2>

      <form onSubmit={create} className="mb-6 grid sm:grid-cols-3 gap-3">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="border rounded px-3 py-2"/>
        <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Location" className="border rounded px-3 py-2"/>
        <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Add</button>
      </form>

      <div className="mb-4 flex gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="border rounded px-3 py-2 flex-1"/>
        <button onClick={load} className="border rounded px-4 py-2 hover:bg-gray-50">Search</button>
      </div>

      {err && <p className="text-red-600 mb-3">{err}</p>}
      {loading ? <p>Loading...</p> : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a)=>(
            <li key={a._id} className="border rounded-xl p-4">
              <div className="font-semibold">{a.name}</div>
              <div className="text-sm text-gray-600">{a.location || "—"}</div>
              {a.sentimentSummary?.updatedAt && (
                <div className="mt-2 text-xs text-gray-500">
                  Sentiment avg: {a.sentimentSummary.avgScore?.toFixed(2)} ·
                  +{a.sentimentSummary.positive || 0}/-{a.sentimentSummary.negative || 0}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
