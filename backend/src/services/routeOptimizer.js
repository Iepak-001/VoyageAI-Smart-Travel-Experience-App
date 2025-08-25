import { getDistanceMatrix } from "./googleDistance.js";

/**
 * TSP-ish optimizer with input sanitization and matrix healing.
 * - trims & dedupes places
 * - drops unresolved origins/destinations from Google's response
 * - guards against missing elements and NOT_FOUND, treating them as Infinity
 */
export async function optimizeRoute(placesInput) {
  // 1) sanitize input
  const places = Array.from(
    new Set((placesInput || []).map(p => (p || "").trim()).filter(Boolean))
  );
  if (places.length < 2) {
    return { order: places, totalDuration: 0, totalDistance: 0, note: "Need 2+ valid places" };
  }

  // 2) fetch matrix
  const matrixData = await getDistanceMatrix(places, places);
  const { rows = [], origin_addresses = [], destination_addresses = [] } = matrixData || {};

  // 3) filter out unresolved addresses ('')
  const validIdx = [];
  for (let i = 0; i < places.length; i++) {
    const okOrigin = !!(origin_addresses[i] && origin_addresses[i].trim());
    const okDest = !!(destination_addresses[i] && destination_addresses[i].trim());
    if (okOrigin && okDest) validIdx.push(i);
  }

  if (validIdx.length < 2) {
    return {
      order: validIdx.map(i => places[i]),
      totalDuration: 0,
      totalDistance: 0,
      note: "Too few resolvable places from Google. Try refining names/addresses."
    };
  }

  // 4) build healed cost & distance matrices for only valid indices
  const n = validIdx.length;
  const cost = Array.from({ length: n }, () => Array(n).fill(Infinity));
  const dist = Array.from({ length: n }, () => Array(n).fill(Infinity));

  for (let a = 0; a < n; a++) {
    const i = validIdx[a];
    const row = rows[i]?.elements || [];
    for (let b = 0; b < n; b++) {
      const j = validIdx[b];
      const el = row[j]; // may be undefined if Google skipped it
      if (el && el.status === "OK") {
        cost[a][b] = Number(el.duration?.value ?? Infinity); // seconds
        dist[a][b] = Number(el.distance?.value ?? Infinity); // meters
      } else {
        // NOT_FOUND / ZERO_RESULTS / undefined → keep Infinity
      }
    }
  }

  // 5) if graph too disconnected, just return the sanitized order
  if (!isUsableMatrix(cost)) {
    return {
      order: validIdx.map(i => places[i]),
      totalDuration: 0,
      totalDistance: 0,
      note: "Insufficient connections between points; returning original order."
    };
  }

  // 6) greedy + 2-opt
  let order = greedyOrder(cost);
  order = twoOpt(order, cost);

  // 7) compute totals
  const totalDuration = routeSum(order, cost);
  const totalDistance = routeSum(order, dist);

  return {
    order: order.map(k => places[validIdx[k]]),
    totalDuration,
    totalDistance
  };
}

/* ---------- helpers ---------- */

function isUsableMatrix(m) {
  const n = m.length;
  if (n < 2) return false;
  for (let i = 0; i < n; i++) {
    let hasEdge = false;
    for (let j = 0; j < n; j++) {
      if (i !== j && Number.isFinite(m[i][j])) { hasEdge = true; break; }
    }
    if (!hasEdge) return false;
  }
  return true;
}

function greedyOrder(cost) {
  const n = cost.length;
  const used = new Array(n).fill(false);
  const order = [0];
  used[0] = true;
  while (order.length < n) {
    const last = order[order.length - 1];
    let next = -1, best = Infinity;
    for (let j = 0; j < n; j++) {
      if (!used[j] && cost[last][j] < best) {
        best = cost[last][j]; next = j;
      }
    }
    if (next === -1) break; // disconnected: stop
    used[next] = true;
    order.push(next);
  }
  // append any leftover (disconnected) nodes in original index order
  for (let j = 0; j < n; j++) if (!used[j]) order.push(j);
  return order;
}

function twoOpt(order, cost) {
  const n = order.length;
  let improved = true;
  const routeC = (ord) => routeSum(ord, cost);
  while (improved) {
    improved = false;
    for (let i = 1; i < n - 2; i++) {
      for (let k = i + 1; k < n - 1; k++) {
        const newOrder = order.slice();
        newOrder.splice(i, k - i + 1, ...order.slice(i, k + 1).reverse());
        if (routeC(newOrder) < routeC(order)) {
          order = newOrder;
          improved = true;
        }
      }
    }
  }
  return order;
}

function routeSum(order, mat) {
  let sum = 0;
  for (let i = 0; i < order.length - 1; i++) {
    const a = order[i], b = order[i + 1];
    const w = mat[a]?.[b];
    if (!Number.isFinite(w)) return Infinity;
    sum += w;
  }
  return sum;
}
