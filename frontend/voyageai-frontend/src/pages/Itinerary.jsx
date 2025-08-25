import { useState } from "react";
import api from "../lib/api";

export default function Itinerary() {
  const [region, setRegion] = useState("");
  const [days, setDays] = useState();
  const [attractions, setAttractions] = useState("");
  const [plan, setPlan] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setErr(""); setLoading(true); setPlan(null);
    try {
      const list = attractions.split("\n").map(s=>s.trim()).filter(Boolean);
      const { data } = await api.post("/itinerary/generate", { region, days, attractions: list });
      setPlan(data.data || data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">AI Itinerary (Gemini)</h2>
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        <input className="border rounded px-3 py-2" value={region} onChange={(e)=>setRegion(e.target.value)} placeholder="Region or city" />
        <input className="border rounded px-3 py-2" type="number" min={1} value={days} onChange={(e)=>setDays(Number(e.target.value))} placeholder="No of Days"/>
        <button onClick={generate} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Generate</button>
      </div>
      <textarea className="w-full border rounded p-3 h-40 mb-4" value={attractions} onChange={(e)=>setAttractions(e.target.value)} placeholder="Enter Attractions to Visit (OPTIONAL)" />
      {err && <p className="text-red-600">{err}</p>}
      {loading && <p>Thinking…</p>}
      {plan?.days && (
        <div className="space-y-4">
          {plan.days.map((d) => (
            <div key={d.day} className="border rounded-xl p-4 text-amber-50">
              <h3 className="font-semibold mb-2">Day {d.day}: {d.title}</h3>
              <ul className="space-y-1">
                {d.schedule?.map((s, i)=>(
                  <li key={i} className="text-sm text-amber-50">• {s.time} — <strong>{s.place}</strong>: {s.activity}</li>
                ))}
              </ul>
            </div>
          ))}
          {plan.summary && <p className="text-amber-50">{plan.summary}</p>}
        </div>
      )}
      {!plan?.days && plan?.raw && (
        <pre className="border rounded-xl p-3 overflow-auto text-sm">{plan.raw}</pre>
      )}
    </section>
  );
}
