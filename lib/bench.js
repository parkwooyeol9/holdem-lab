import data from "./data/bench-mix.json" with { type: "json" };

const RANKS = "AKQJT98765432";

export const BENCH_META = data.meta;

export function handBucket(hand) {
  if (!hand) return "offsuit";
  if (hand.length === 2) {
    const rank = RANKS.indexOf(hand[0]);
    if (rank <= 1) return "QQ+";
    if (rank <= 3) return "TT-JJ";
    if (rank <= 6) return "77-99";
    return "22-66";
  }
  const suited = hand.endsWith("s");
  const high = hand[0];
  const low = hand[1];
  if (high === "A") return suited ? "Axs" : "Axo";
  if (high === "K" && RANKS.indexOf(low) <= 4) return "Kbroad";
  if (suited && RANKS.indexOf(low) - RANKS.indexOf(high) <= 3) return "sc";
  if (!suited && RANKS.indexOf(high) <= 3 && RANKS.indexOf(low) <= 5) return "broadway-o";
  return "offsuit";
}

function countsOf(row) {
  if (!row) return null;
  const mix = {};
  let n = 0;
  for (const [key, value] of Object.entries(row)) {
    if (key === "n") continue;
    mix[key] = value;
    n += value;
  }
  return n ? { n: row.n || n, mix } : null;
}

export function lookupLayers({ kind, heroPos, hand, vs } = {}) {
  if (!kind || !heroPos || !hand) return { bucket: null, vsBucket: null, exact: null, opener: null };
  const bucket = countsOf(data.b?.[`${kind}|${heroPos}|${handBucket(hand)}`]);
  const exact = countsOf(data.e?.[`${kind}|${heroPos}|${hand}`]);
  const opener = vs ? countsOf(data.o?.[`${kind}|${heroPos}|${vs}|${hand}`]) : null;
  const vsBucket = vs ? countsOf(data.vb?.[`${kind}|${heroPos}|${vs}|${handBucket(hand)}`]) : null;
  return { bucket, vsBucket, exact, opener };
}

export function lookupBench({ kind, heroPos, hand, vs } = {}) {
  const layers = lookupLayers({ kind, heroPos, hand, vs });
  if (layers.opener && layers.opener.n >= 8) return { ...layers.opener, key: `${kind}|${heroPos}|${vs}|${hand}`, table: "o" };
  if (layers.exact) return { ...layers.exact, key: `${kind}|${heroPos}|${hand}`, table: "e" };
  if (layers.opener) return { ...layers.opener, key: `${kind}|${heroPos}|${vs}|${hand}`, table: "o" };
  if (layers.vsBucket) return { ...layers.vsBucket, key: `${kind}|${heroPos}|${vs}|${handBucket(hand)}`, table: "vb" };
  if (layers.bucket) return { ...layers.bucket, key: `${kind}|${heroPos}|${handBucket(hand)}`, table: "b" };
  return null;
}

export function pctMix(counts) {
  const n = Object.values(counts).reduce((s, v) => s + v, 0);
  if (!n) return {};
  const out = {};
  for (const [key, value] of Object.entries(counts)) out[key] = (value / n) * 100;
  return out;
}

export function shrinkMix(chart, bench, pseudo = 8) {
  if (!bench?.n) return { raw: { ...chart }, source: "chart", n: 0, weight: 0 };
  const weight = bench.n / (bench.n + pseudo);
  const benchPct = pctMix(bench.mix);
  const keys = new Set([...Object.keys(chart || {}), ...Object.keys(benchPct)]);
  const raw = {};
  for (const key of keys) {
    const prior = chart?.[key] || 0;
    const observed = benchPct[key] || 0;
    raw[key] = observed * weight + prior * (1 - weight);
  }
  return { raw, source: "pokerbench", n: bench.n, weight, key: bench.key };
}

const LAYER_ORDER = [
  ["bucket", 14, "b"],
  ["vsBucket", 10, "vb"],
  ["exact", 8, "e"],
  ["opener", 6, "o"]
];

export function hierarchicalMix(chart, layers) {
  let raw = { ...(chart || {}) };
  let used = 0;
  for (const [name, pseudo] of LAYER_ORDER) {
    const row = layers?.[name];
    if (!row?.n) continue;
    raw = shrinkMix(raw, { ...row, key: name }, pseudo).raw;
    used += 1;
  }
  if (!used) return { raw, source: "chart", n: 0, weight: 0, table: "chart", key: null };
  const table =
    layers.opener?.n >= 8 ? "o" : layers.exact?.n ? "e" : layers.vsBucket?.n ? "vb" : layers.bucket?.n ? "b" : "o";
  const n =
    layers.opener?.n >= 8
      ? layers.opener.n
      : layers.exact?.n || layers.opener?.n || layers.vsBucket?.n || layers.bucket?.n || 0;
  return { raw, source: "pokerbench", n, weight: n / (n + 8), table, layers: used };
}

function actionShare(row, action) {
  const n = row?.n || 0;
  if (!n) return 0;
  return (row[action] || 0) / n;
}

export function actionFreqMap(kind, pos, action, vs = null, minN = 4) {
  const out = {};
  if (vs) {
    const prefix = `${kind}|${pos}|${vs}|`;
    for (const [key, row] of Object.entries(data.o || {})) {
      if (!key.startsWith(prefix) || (row.n || 0) < minN) continue;
      out[key.slice(prefix.length)] = actionShare(row, action);
    }
  }
  if (Object.keys(out).length >= 8) return out;
  const prefix = `${kind}|${pos}|`;
  for (const [key, row] of Object.entries(data.e || {})) {
    if (!key.startsWith(prefix) || (row.n || 0) < minN) continue;
    const hand = key.slice(prefix.length);
    if (hand.includes("|")) continue;
    if (out[hand] == null) out[hand] = actionShare(row, action);
  }
  return out;
}
