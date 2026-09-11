import { combosFromWeights, equityVsRandom, equityVsRange, holeLabel } from "./indicators";
import { actionFreqMap, hierarchicalMix, lookupLayers } from "./bench";
import { POS_6, STAT_FIELDS, classify, isLoose, isPassive, rangeWidth } from "./villains";

const RANKS = "AKQJT98765432";

const RFI = {
  UTG: "77+,ATs+,AJo+,KQs,KQo,QJs,JTs,T9s",
  HJ: "66+,A9s+,ATo+,KJs+,KQo,QJs,JTs,T9s,98s,87s",
  CO: "22+,A2s+,A9o+,K9s+,KJo+,Q9s+,QJo,J9s+,T8s+,98s,87s,76s",
  BTN: "22+,A2s+,A5o+,K9s+,KTo+,Q8s+,QTo+,J8s+,JTo,T8s+,97s+,87s,76s,65s,54s,43s",
  SB: "22+,A2s+,ATo+,K9s+,KJo+,Q9s+,QJo,J9s+,T8s+,98s,87s,76s",
  BB: "22+,A2s+,ATo+,KTs+,KQo,QTs+,JTs,T9s"
};

const VALUE_3BET = {
  UTG: "QQ+,AKs,AKo",
  HJ: "JJ+,AKs,AKo",
  CO: "TT+,AQs+,AKo",
  BTN: "TT+,AJs+,AQo+",
  SB: "JJ+,AQs+,AKo",
  BB: "JJ+,AQs+,AKo"
};

const LIGHT_3BET = {
  UTG: "A5s,A4s,KJs,QJs,76s",
  HJ: "A5s,A4s,A3s,KTs+,QJs,JTs,65s",
  CO: "A5s-A2s,KTs,QTs+,JTs,T9s,98s,87s,76s",
  BTN: "A5s-A2s,K9s+,QTs+,J9s+,T9s,98s,87s,76s",
  SB: "A5s-A2s,KJs,QJs,JTs,76s",
  BB: "A5s-A2s,KTs+,QJs,JTs,T9s,87s,76s"
};

const CALL_OPEN = {
  UTG: "77-JJ,AQs,AJs,KQs",
  HJ: "66-TT,AQs,AJs,KQs,QJs,JTs",
  CO: "22-99,ATs+,KJs+,QJs,JTs,T9s,98s,87s",
  BTN: "22-99,A2s+,K9s+,Q9s+,J9s+,T8s+,98s,87s,76s,65s,AJo,KQo",
  SB: "88-TT,AQs,AJs,KQs",
  BB: "22-TT,A2s+,ATo+,K9s+,KJo+,Q9s+,QJo,J8s+,T8s+,97s+,87s,76s,65s,54s"
};

const CALL_3BET = "QQ+,AKs,AKo,JJ,AQs";
const FOUR_BET = "KK+,AKs,AKo";
const ISOLATE_LIMP = "22+,A2s+,A9o+,K9s+,KTo+,Q9s+,QJo,J9s+,T8s+,98s,87s,76s";

const RANGE_CACHE = new Map();

function addHand(set, high, low, suited) {
  if (high === low) set.add(high + low);
  else set.add(high + low + (suited ? "s" : "o"));
}

function expandToken(token, set) {
  const plus = token.endsWith("+");
  const body = plus ? token.slice(0, -1) : token;
  const dash = body.split("-");
  if (dash.length === 2) {
    expandToken(dash[0] + (plus ? "+" : ""), set);
    expandToken(dash[1], set);
    const a = dash[0];
    const b = dash[1];
    if (a.length >= 2 && b.length >= 2 && a[0] === b[0] && a[2] === b[2]) {
      const high = a[0];
      const suited = a[2] === "s";
      const from = RANKS.indexOf(a[1]);
      const to = RANKS.indexOf(b[1]);
      const lo = Math.min(from, to);
      const hi = Math.max(from, to);
      for (let i = lo; i <= hi; i++) addHand(set, high, RANKS[i], suited);
    }
    return;
  }

  if (body.length === 2 && body[0] === body[1]) {
    const start = RANKS.indexOf(body[0]);
    if (plus) {
      for (let i = 0; i <= start; i++) set.add(RANKS[i] + RANKS[i]);
    } else set.add(body);
    return;
  }

  if (body.length === 3 && (body[2] === "s" || body[2] === "o")) {
    const high = body[0];
    const low = body[1];
    const suited = body[2] === "s";
    if (plus) {
      const start = RANKS.indexOf(low);
      const cap = RANKS.indexOf(high);
      for (let i = start; i > cap; i--) addHand(set, high, RANKS[i], suited);
    } else addHand(set, high, low, suited);
  }
}

export function expandRange(src) {
  const key = src || "";
  if (RANGE_CACHE.has(key)) return RANGE_CACHE.get(key);
  const set = new Set();
  for (const token of key.split(",").map((s) => s.trim()).filter(Boolean)) expandToken(token, set);
  RANGE_CACHE.set(key, set);
  return set;
}

export function inRange(hand, src) {
  if (!hand || !src) return false;
  return expandRange(src).has(hand);
}

function merge(...parts) {
  return parts.filter(Boolean).join(",");
}

export function parseSpot(actions, heroPos) {
  const heroIdx = POS_6.indexOf(heroPos);
  const before = POS_6.slice(0, Math.max(0, heroIdx)).map((pos) => ({ pos, action: actions?.[pos] || "" }));
  const incomplete = before.some((p) => !p.action);
  let level = 0;
  let opener = null;
  let threeBettor = null;
  const limpers = [];
  const callers = [];

  for (const p of before) {
    if (!p.action || p.action === "fold") continue;
    if (p.action === "limp") {
      limpers.push(p.pos);
      if (level < 1) level = 1;
    } else if (p.action === "open") {
      opener = p.pos;
      level = 2;
    } else if (p.action === "call") {
      callers.push(p.pos);
    } else if (p.action === "3bet") {
      threeBettor = p.pos;
      level = 3;
    } else if (p.action === "4bet") {
      threeBettor = p.pos;
      level = 4;
    }
  }

  return { incomplete, level, opener, threeBettor, limpers, callers, before, heroPos };
}

export function legalActions(actions, pos) {
  const idx = POS_6.indexOf(pos);
  const before = {};
  for (const p of POS_6.slice(0, idx)) before[p] = actions?.[p];
  const spot = parseSpot(before, pos);
  if (spot.level <= 1) return ["fold", "limp", "open"];
  if (spot.level === 2) return ["fold", "call", "3bet"];
  if (spot.level === 3) return ["fold", "call", "4bet"];
  return ["fold", "call"];
}

export function raiseLevel(actions, untilPos) {
  return parseSpot(actions, untilPos).level;
}

function villainOf(seats, pos) {
  return classify(seats?.[pos]);
}

function vsLine(read, pos) {
  if (!pos) return "";
  if (!read || read.confidence === "none") return `vs unknown ${pos}`;
  return `vs ${read.label} ${pos}`;
}

export function normalizeMix(raw) {
  const entries = Object.entries(raw).filter(([, n]) => n > 0);
  const sum = entries.reduce((s, [, n]) => s + n, 0);
  if (!sum) return [];
  const scaled = entries.map(([label, n]) => ({ label, pct: Math.round((n / sum) * 100) }));
  scaled.sort((a, b) => b.pct - a.pct);
  const drift = 100 - scaled.reduce((s, e) => s + e.pct, 0);
  if (scaled[0]) scaled[0].pct += drift;
  return scaled.filter((e) => e.pct > 0);
}

export function pack(hand, heroPos, reason, raw, extra = {}) {
  const mix = normalizeMix(raw);
  const headline = mix.map((m) => `${m.label} ${m.pct}%`).join(" · ") || "—";
  return {
    action: mix[0]?.label || "—",
    headline,
    detail: `${hand} · ${heroPos}`,
    reason,
    mix,
    ...extra
  };
}

export function emptyRec(detail, reason) {
  return { action: "—", headline: "—", detail, reason, mix: [], source: "none", benchN: 0, solverWeight: 0, hud: 0, equity: null };
}

export function bump(raw, key, delta) {
  if (raw[key] == null && delta < 0) return raw;
  raw[key] = Math.max(0, (raw[key] || 0) + delta);
  return raw;
}

function raiseKey(raw) {
  return ["3-bet", "4-bet", "Raise", "Open"].find((k) => raw[k] != null);
}

function hudWeight(read) {
  if (!read || read.confidence === "none") return 0;
  const conf = read.confidence === "high" ? 1 : read.confidence === "medium" ? 0.72 : 0.42;
  return Math.min(1, (read.filled || 0) / STAT_FIELDS.length) * 0.42 * conf;
}

function trait(read, key, fallback = 0.5) {
  return read?.traits?.[key] ?? fallback;
}

function applyVillainMix(raw, read, kind, solverWeight = 0) {
  const w = hudWeight(read) * (1 - 0.55 * (solverWeight || 0));
  if (!w) return raw;
  const s = read?.stats || {};
  const raise = raiseKey(raw);
  const overfold = trait(read, "overfold");
  const overcall = trait(read, "overcall");
  const agg = trait(read, "aggression");
  const loose = trait(read, "looseness");
  const scaled = (n) => n * w;
  if (raise) {
    bump(raw, raise, scaled((overfold - 0.5) * 28 - (overcall - 0.5) * 26 + (agg - 0.5) * 10));
  }
  bump(raw, "Call", scaled((overcall - 0.5) * 24 - (overfold - 0.5) * 14));
  bump(raw, "Fold", scaled((0.5 - loose) * 16 + (overfold - 0.5) * 8 - (overcall - 0.5) * 10));
  if (kind === "open" && s.foldToCbet != null && raise) {
    bump(raw, raise, scaled(((s.foldToCbet - 45) / 20) * 8));
  }
  if (kind === "open" && s.steal != null && raise) {
    bump(raw, raise, scaled(((s.steal - 32) / 18) * 6));
  }
  if (s.wtsd != null) {
    bump(raw, "Call", scaled(((s.wtsd - 26) / 10) * 5));
    if (raise) bump(raw, raise, scaled(((26 - s.wtsd) / 10) * 4));
  }
  return raw;
}

function applyStack(raw, stackBB) {
  if (stackBB == null || stackBB >= 40) return raw;
  const short = Math.max(0, Math.min(1, (40 - stackBB) / 32));
  bump(raw, "Call", -14 * short);
  bump(raw, "Limp", -10 * short);
  bump(raw, "Fold", 8 * short);
  const raise = raiseKey(raw);
  if (stackBB <= 14 && raise && raise !== "All-in") {
    const mass = raw[raise] || 0;
    bump(raw, "All-in", mass * 0.55 * short);
    bump(raw, raise, -mass * 0.4 * short);
  }
  return raw;
}

function blendPriors(parts) {
  const raw = {};
  let wsum = 0;
  for (const part of parts) {
    const w = part?.w || 0;
    if (w <= 0 || !part.mix) continue;
    wsum += w;
    for (const [key, value] of Object.entries(part.mix)) raw[key] = (raw[key] || 0) + w * value;
  }
  if (!wsum) return { Fold: 100 };
  for (const key of Object.keys(raw)) raw[key] /= wsum;
  return raw;
}

function handRank(hand) {
  if (!hand) return 0;
  if (hand.length === 2) return 220 - RANKS.indexOf(hand[0]) * 8;
  const suited = hand[2] === "s" ? 14 : 0;
  return 120 - RANKS.indexOf(hand[0]) * 8 - RANKS.indexOf(hand[1]) * 2.4 + suited;
}

function widenRange(src, width) {
  const base = expandRange(src);
  if (width === "base" || !base.size) return base;
  const ranked = [...base].sort((a, b) => handRank(b) - handRank(a));
  if (width === "tight") {
    const keep = Math.max(6, Math.ceil(ranked.length * 0.72));
    return new Set(ranked.slice(0, keep));
  }
  const extra = width === "wide" ? merge(src, "22+,A2s+,A9o+,KTo+,QTo+,JTo,T9s,98s,87s,76s,65s") : src;
  return expandRange(extra);
}

function weightRange(classes, freqMap, width) {
  const weights = {};
  for (const hand of classes) {
    const freq = freqMap?.[hand];
    weights[hand] = freq == null ? 1 : Math.max(0.12, freq);
  }
  if (width === "wide") {
    for (const [hand, freq] of Object.entries(freqMap || {})) {
      if (weights[hand] == null && freq >= 0.35) weights[hand] = freq * 0.7;
    }
  }
  if (width === "tight") {
    for (const hand of Object.keys(weights)) {
      if (handRank(hand) < 70) delete weights[hand];
    }
  }
  return weights;
}

function spotKind(spot) {
  if (spot.level <= 1 && !spot.limpers.length) return "rfi";
  if (spot.level <= 1) return "limp";
  if (spot.level === 2) return "vsOpen";
  if (spot.level === 3) return "vs3bet";
  return "vs4bet";
}

function vsSeat(spot) {
  const kind = spotKind(spot);
  if (kind === "vsOpen") return spot.opener;
  if (kind === "vs3bet" || kind === "vs4bet") return spot.threeBettor;
  return null;
}

function villainRange(spot, read) {
  const kind = spotKind(spot);
  const width = rangeWidth(read);
  if (kind === "vsOpen" && spot.opener) {
    const classes = widenRange(RFI[spot.opener], width);
    const freq = actionFreqMap("rfi", spot.opener, "Open");
    return {
      weights: weightRange(classes, freq, width),
      label: `${spot.opener} open${width === "base" ? "" : ` · ${width}`}`
    };
  }
  if (kind === "vs3bet" && spot.threeBettor) {
    const src = merge(VALUE_3BET[spot.threeBettor], LIGHT_3BET[spot.heroPos], LIGHT_3BET[spot.threeBettor]);
    const classes = widenRange(src, width);
    const freq = actionFreqMap("vsOpen", spot.threeBettor, "3-bet", spot.opener);
    return {
      weights: weightRange(classes, freq, width),
      label: `${spot.threeBettor} 3-bet${width === "base" ? "" : ` · ${width}`}`
    };
  }
  if (kind === "vs4bet") {
    const freq = actionFreqMap("vs3bet", spot.threeBettor || spot.heroPos, "4-bet");
    return { weights: weightRange(expandRange(FOUR_BET), freq, width), label: "4-bet range" };
  }
  if (kind === "limp") {
    return { weights: weightRange(expandRange("22+,A2s+,A9o+,K9s+,QTo+,JTo,T9s,98s,87s"), null, width), label: "limp range" };
  }
  return null;
}

const EQ_CACHE = new Map();

function equityFor(hole, spot, read) {
  const width = rangeWidth(read);
  const key = `${hole[0]}${hole[1]}|${spotKind(spot)}|${vsSeat(spot) || ""}|${width}`;
  if (EQ_CACHE.has(key)) return EQ_CACHE.get(key);
  const vs = villainRange(spot, read);
  let result = null;
  if (vs?.weights) {
    const combos = combosFromWeights(vs.weights, hole);
    const eq = equityVsRange(hole, [], combos, 1000);
    if (eq) result = { ...eq, vs: vs.label };
  }
  if (!result) {
    const pct = equityVsRandom(hole, [], 1, 900);
    result = pct == null ? null : { pct, samples: 900, combos: null, vs: "random" };
  }
  if (EQ_CACHE.size > 80) EQ_CACHE.clear();
  EQ_CACHE.set(key, result);
  return result;
}

function finish(hand, heroPos, hole, spot, seats, reasonBase, chart, hudKind, stackBB) {
  const kind = spotKind(spot);
  const vs = vsSeat(spot);
  const layers = lookupLayers({ kind, heroPos, hand, vs });
  const shrunk = hierarchicalMix(chart, layers);
  const read = vs ? villainOf(seats, vs) : kind === "limp" && spot.limpers[0] ? villainOf(seats, spot.limpers[0]) : null;
  const hud = hudWeight(read);
  applyVillainMix(shrunk.raw, read, hudKind, shrunk.weight);
  applyStack(shrunk.raw, stackBB);
  const equity = hole?.[0] && hole?.[1] ? equityFor(hole, spot, read) : null;
  const solverPct = Math.round((shrunk.weight || 0) * 100);
  const layerNote = shrunk.table && shrunk.table !== "chart" ? ` (${shrunk.table} node)` : "";
  const reason =
    shrunk.source === "pokerbench"
      ? `${reasonBase} PokerBench n=${shrunk.n}${layerNote} at ${kind}${vs ? ` vs ${vs}` : ""} · ${solverPct}% solver weight after hierarchical shrink.${hud ? ` HUD scaled to ${Math.round(hud * 100)}%.` : ""}${stackBB && stackBB < 40 ? ` Stack ${stackBB}BB short-stack overlay.` : ""}`
      : `${reasonBase} Chart prior for 6-max 100bb — this exact node is thin in PokerBench.${hud ? ` HUD scaled to ${Math.round(hud * 100)}%.` : ""}`;
  return pack(hand, heroPos, reason, shrunk.raw, {
    source: shrunk.source,
    benchN: shrunk.n,
    solverWeight: shrunk.weight,
    benchTable: shrunk.table,
    hud: hud || 0,
    equity
  });
}

export function recommend({ hole, heroPos, actions, seats, stackBB } = {}) {
  const hand = holeLabel(hole);
  if (!hand) {
    return emptyRec("Need hole cards", "Tap your two cards, then mark the action in front of you.");
  }

  const spot = parseSpot(actions, heroPos);
  if (spot.incomplete) {
    return emptyRec(`${hand} · ${heroPos}`, "Mark fold / limp / open / call / 3-bet for every seat in front of you.");
  }

  if (spot.level <= 1) return rfiOrIsolate(hand, heroPos, spot, seats, hole, stackBB);
  if (spot.level === 2) return vsOpen(hand, heroPos, spot, seats, hole, stackBB);
  if (spot.level === 3) return vsThreeBet(hand, heroPos, spot, seats, hole, stackBB);
  return vsFourBet(hand, heroPos, spot, seats, hole, stackBB);
}

function rfiOrIsolate(hand, heroPos, spot, seats, hole, stackBB) {
    if (!spot.limpers.length) {
    if (heroPos === "BB") {
      return pack(hand, heroPos, "Folded to you in the big blind — take the free check.", { Check: 100 }, { source: "chart", benchN: 0, solverWeight: 0, hud: 0, equity: null });
    }
    let raw;
    if (inRange(hand, RFI.UTG)) raw = { Open: 100 };
    else if (inRange(hand, RFI.HJ) && inRange(hand, RFI[heroPos])) raw = { Open: 86, Fold: 14 };
    else if (inRange(hand, RFI[heroPos])) raw = { Open: 72, Fold: 28 };
    else if (heroPos === "SB") raw = { Fold: 78, Limp: 14, Open: 8 };
    else raw = { Fold: 94, Open: 6 };
    return finish(hand, heroPos, hole, spot, seats, `${hand} first-in from ${heroPos}.`, raw, "rfi", stackBB);
  }

  const limpRead = villainOf(seats, spot.limpers[0]);
  const isolate = merge(ISOLATE_LIMP, isLoose(limpRead) ? "A7o+,KJo+,QTo+,JTo" : "");
  const inIso = inRange(hand, isolate);
  const raw = blendPriors([
    { w: heroPos === "BB" && inIso ? 1 : 0, mix: { Raise: 70, Check: 30 } },
    { w: heroPos === "BB" && !inIso ? 1 : 0, mix: { Check: 82, Raise: 18 } },
    { w: heroPos !== "BB" && inIso ? 1 : 0, mix: { Raise: 78, Fold: 16, Call: 6 } },
    { w: heroPos !== "BB" && !inIso ? 1 : 0, mix: { Fold: 80, Call: 12, Raise: 8 } }
  ]);
  return finish(
    hand,
    heroPos,
    hole,
    spot,
    seats,
    `Isolate vs limp${spot.limpers.length > 1 ? "s" : ""} (${spot.limpers.join(", ")}). ${vsLine(limpRead, spot.limpers[0])}.`,
    raw,
    "rfi",
    stackBB
  );
}

function vsOpen(hand, heroPos, spot, seats, hole, stackBB) {
  const opener = spot.opener;
  const read = villainOf(seats, opener);
  const ip = POS_6.indexOf(heroPos) > POS_6.indexOf(opener) && heroPos !== "BB" && heroPos !== "SB";
  const value = VALUE_3BET[opener] || VALUE_3BET.UTG;
  const stealSpot = opener === "BTN" || opener === "CO" || opener === "SB";
  const overfold = trait(read, "overfold");
  const overcall = trait(read, "overcall");
  const callRange = CALL_OPEN[heroPos] || CALL_OPEN.BB;
  const extraCall = isPassive(read) || (ip && isLoose(read)) || overcall >= 0.6 ? "22+,A9s+,KJs,QJs,JTs,T9s,98s" : "";
  const canCall = inRange(hand, merge(callRange, extraCall));
  const multiway = spot.callers.length > 0;
  const lightW =
    (inRange(hand, LIGHT_3BET[heroPos]) ? 1 : 0) *
    (0.22 + overfold * 0.7 + (stealSpot ? 0.18 : 0) - overcall * 0.55) *
    (multiway ? 0.45 : 1);
  const raw = inRange(hand, value)
    ? { "3-bet": 80, Call: 16, Fold: 4 }
    : blendPriors([
        { w: Math.max(0, lightW), mix: { "3-bet": 54, Call: 22, Fold: 24 } },
        { w: canCall ? 0.7 + overcall * 0.5 + (ip ? 0.15 : 0) : 0, mix: { Call: 60, "3-bet": 20, Fold: 20 } },
        { w: 0.22 + (multiway ? 0.45 : 0) + (read.core === "nit" && !inRange(hand, "QQ+,AKs,AKo") ? 0.55 : 0), mix: { Fold: 78, Call: 14, "3-bet": 8 } }
      ]);
  return finish(hand, heroPos, hole, spot, seats, `Facing ${opener} open ${vsLine(read, opener)}.`, raw, "open", stackBB);
}

function vsThreeBet(hand, heroPos, spot, seats, hole, stackBB) {
  const aggro = villainOf(seats, spot.threeBettor);
  const vs = vsLine(aggro, spot.threeBettor);
  const overcall = trait(aggro, "overcall");
  const overfold = trait(aggro, "overfold");
  const raw = blendPriors([
    { w: inRange(hand, FOUR_BET) ? 1.5 : inRange(hand, "QQ+,AKs,AKo") ? 0.7 + trait(aggro, "aggression") : 0, mix: { "4-bet": 72, Call: 22, Fold: 6 } },
    { w: inRange(hand, CALL_3BET) ? 0.8 + overfold * 0.3 : 0, mix: { Call: 62, "4-bet": 24, Fold: 14 } },
    { w: overcall * 0.9 + (isPassive(aggro) ? 0.35 : 0), mix: inRange(hand, "JJ+,AQs+,AKo") ? { Call: 70, Fold: 22, "4-bet": 8 } : { Fold: 74, Call: 20, "4-bet": 6 } },
    { w: 0.28 + (aggro.core === "nit" ? 0.5 : 0), mix: { Fold: 82, Call: 12, "4-bet": 6 } }
  ]);
  return finish(hand, heroPos, hole, spot, seats, `Facing a 3-bet ${vs}.`, raw, "3bet", stackBB);
}

function vsFourBet(hand, heroPos, spot, seats, hole, stackBB) {
  const vs = vsLine(villainOf(seats, spot.threeBettor), spot.threeBettor);
  const raw = inRange(hand, "KK+,AKs") ? { "All-in": 82, Fold: 18 } : { Fold: 88, Call: 8, "All-in": 4 };
  return finish(hand, heroPos, hole, spot, seats, `4-bet pots stay premium-only. ${vs}.`, raw, "3bet", stackBB);
}
