import { useState } from "react";
import api from "../lib/api";

export default function Planner() {
  const [input, setInput] = useState("New York, NY\nPhiladelphia, PA\nWashington, DC\nBoston, MA");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const optimize = async () => {
    setErr(""); setLoading(true); setResult(null);
    try {
      const places = input.split("\n").map(s=>s.trim()).filter(Boolean);
      const { data } = await api.post("/itinerary/optimize", { places });
      setResult(data.data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Route Optimizer</h2>
      <p className="text-gray-600 mb-3">Enter one place per line, then optimize.</p>
      <textarea
        className="w-full border rounded p-3 h-40"
        value={input}
        onChange={(e)=>setInput(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <button onClick={optimize} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Optimize</button>
        {loading && <span>Calculating…</span>}
      </div>
      {err && <p className="text-red-600 mt-3">{err}</p>}
      {result && (
        <div className="mt-5 border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Order</h3>
          <ol className="list-decimal list-inside space-y-1">
            {result.order.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
          <div className="mt-3 text-sm text-gray-600">
            Total time: {(result.totalDuration/3600).toFixed(2)} h · Distance: {(result.totalDistance/1000).toFixed(1)} km
          </div>
        </div>
      )}
    </section>
  );
}
