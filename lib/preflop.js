import { holeLabel } from "./indicators";
import { POS_6, classify, isLoose, isPassive } from "./villains";

const RANKS = "AKQJT98765432";

const RFI = {
  UTG: "77+,ATs+,AJo+,KQs,KQo,QJs,JTs,T9s",
  HJ: "66+,A9s+,ATo+,KJs+,KQo,QJs,JTs,T9s,98s,87s",
  CO: "22+,A2s+,A9o+,K9s+,KJo+,Q9s+,QJo,J9s+,T8s+,98s,87s,76s",
  BTN: "22+,A2s+,A7o+,K9s+,KTo+,Q8s+,QTo+,J8s+,JTo,T8s+,97s+,87s,76s,65s,54s",
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

function pack(hand, heroPos, reason, raw) {
  const mix = normalizeMix(raw);
  const headline = mix.map((m) => `${m.label} ${m.pct}%`).join(" · ") || "—";
  return {
    action: mix[0]?.label || "—",
    headline,
    detail: `${hand} · ${heroPos}`,
    reason,
    mix
  };
}

function emptyRec(detail, reason) {
  return { action: "—", headline: "—", detail, reason, mix: [] };
}

function bump(raw, key, delta) {
  if (raw[key] == null && delta < 0) return raw;
  raw[key] = Math.max(0, (raw[key] || 0) + delta);
  return raw;
}

function raiseKey(raw) {
  return ["3-bet", "4-bet", "Raise", "Open"].find((k) => raw[k] != null);
}

function applyVillainMix(raw, read, kind) {
  const s = read?.stats || {};
  const raise = raiseKey(raw);
  if (read?.modifiers?.includes("overfolder") || (s.foldTo3bet != null && s.foldTo3bet >= 68)) {
    if (raise) bump(raw, raise, kind === "open" ? 14 : 8);
    bump(raw, "Fold", -10);
  }
  if (read?.modifiers?.includes("overcaller") || read?.core === "fish" || read?.core === "lp") {
    if (raise) bump(raw, raise, -14);
    bump(raw, "Call", 12);
  }
  if (kind === "open" && s.foldToCbet != null && s.foldToCbet >= 62 && raise) bump(raw, raise, 8);
  if (kind === "open" && s.foldToCbet != null && s.foldToCbet <= 30) {
    if (raise) bump(raw, raise, -10);
    bump(raw, "Call", 8);
  }
  if (kind === "open" && s.steal != null && s.steal >= 44 && raise) bump(raw, raise, 8);
  if (s.wtsd != null && s.wtsd >= 36) {
    if (raise) bump(raw, raise, -8);
    bump(raw, "Call", 6);
  }
  if (read?.core === "nit") bump(raw, "Fold", 14);
  if (read?.core === "lag" || read?.core === "maniac") bump(raw, "Fold", 8);
  return raw;
}

export function recommend({ hole, heroPos, actions, seats }) {
  const hand = holeLabel(hole);
  if (!hand) {
    return emptyRec("Need hole cards", "Tap your two cards, then mark the action in front of you.");
  }

  const spot = parseSpot(actions, heroPos);
  if (spot.incomplete) {
    return emptyRec(`${hand} · ${heroPos}`, "Mark fold / limp / open / call / 3-bet for every seat in front of you.");
  }

  if (spot.level <= 1) return rfiOrIsolate(hand, heroPos, spot, seats);
  if (spot.level === 2) return vsOpen(hand, heroPos, spot, seats);
  if (spot.level === 3) return vsThreeBet(hand, heroPos, spot, seats);
  return vsFourBet(hand, heroPos, spot, seats);
}

function rfiOrIsolate(hand, heroPos, spot, seats) {
  if (!spot.limpers.length) {
    if (heroPos === "BB") {
      return pack(hand, heroPos, "Folded to you in the big blind — take the free check.", { Check: 100 });
    }
    let raw;
    if (inRange(hand, RFI.UTG)) raw = { Open: 100 };
    else if (inRange(hand, RFI.HJ) && inRange(hand, RFI[heroPos])) raw = { Open: 86, Fold: 14 };
    else if (inRange(hand, RFI[heroPos])) raw = { Open: 72, Fold: 28 };
    else if (heroPos === "SB") raw = { Fold: 78, Limp: 14, Open: 8 };
    else raw = { Fold: 94, Open: 6 };
    return pack(hand, heroPos, `${hand} against a standard 6-max ${heroPos} opening chart. Mix is a heuristic, not a solver dump.`, raw);
  }

  const limpRead = villainOf(seats, spot.limpers[0]);
  const isolate = merge(ISOLATE_LIMP, isLoose(limpRead) ? "A7o+,KJo+,QTo+,JTo" : "");
  const inIso = inRange(hand, isolate);
  let raw;
  if (heroPos === "BB") raw = inIso ? { Raise: 70, Check: 30 } : { Check: 82, Raise: 18 };
  else if (inIso) raw = { Raise: 78, Fold: 16, Call: 6 };
  else raw = { Fold: 80, Call: 12, Raise: 8 };
  applyVillainMix(raw, limpRead, "rfi");
  return pack(
    hand,
    heroPos,
    `Isolate mix vs limp${spot.limpers.length > 1 ? "s" : ""} (${spot.limpers.join(", ")}). ${vsLine(limpRead, spot.limpers[0])}.`,
    raw
  );
}

function vsOpen(hand, heroPos, spot, seats) {
  const opener = spot.opener;
  const read = villainOf(seats, opener);
  const ip = POS_6.indexOf(heroPos) > POS_6.indexOf(opener) && heroPos !== "BB" && heroPos !== "SB";
  const value = VALUE_3BET[opener] || VALUE_3BET.UTG;
  const stealSpot = opener === "BTN" || opener === "CO" || opener === "SB";
  const lightOk =
    read.modifiers.includes("overfolder") ||
    read.core === "nit" ||
    (stealSpot && read.core !== "fish" && read.core !== "lp" && !read.modifiers.includes("overcaller"));
  const noBluff = read.core === "fish" || read.core === "lp" || read.modifiers.includes("overcaller") || read.core === "maniac";
  const callRange = CALL_OPEN[heroPos] || CALL_OPEN.BB;
  const extraCall = noBluff || isPassive(read) || (ip && isLoose(read)) ? "22+,A9s+,KJs,QJs,JTs,T9s,98s" : "";
  const canCall = inRange(hand, merge(callRange, extraCall));
  const multiway = spot.callers.length > 0;

  let raw;
  if (inRange(hand, value)) raw = { "3-bet": 78, Call: 18, Fold: 4 };
  else if (lightOk && !noBluff && inRange(hand, LIGHT_3BET[heroPos])) raw = { "3-bet": 52, Call: 22, Fold: 26 };
  else if (read.core === "nit" && !inRange(hand, "QQ+,AKs,AKo")) raw = { Fold: 82, Call: 12, "3-bet": 6 };
  else if (multiway && !inRange(hand, "22-JJ,AQs+,KQs,QJs,JTs,T9s,98s,87s")) raw = { Fold: 78, Call: 16, "3-bet": 6 };
  else if (canCall) raw = noBluff ? { Call: 68, Fold: 22, "3-bet": 10 } : { Call: 58, "3-bet": 22, Fold: 20 };
  else raw = { Fold: 76, Call: 16, "3-bet": 8 };

  applyVillainMix(raw, read, "open");
  return pack(hand, heroPos, `Facing ${opener} open ${vsLine(read, opener)}. Frequencies follow the chart plus this player's HUD.`, raw);
}

function vsThreeBet(hand, heroPos, spot, seats) {
  const aggro = villainOf(seats, spot.threeBettor);
  const vs = vsLine(aggro, spot.threeBettor);
  let raw;
  if (inRange(hand, FOUR_BET) || (aggro.core === "lag" && inRange(hand, "QQ+,AKs,AKo")) || (aggro.core === "maniac" && inRange(hand, "JJ+,AQs+,AKo"))) {
    raw = { "4-bet": 72, Call: 22, Fold: 6 };
  } else if (aggro.modifiers.includes("overcaller") || aggro.core === "fish" || aggro.core === "lp") {
    raw = inRange(hand, "JJ+,AQs+,AKo") ? { Call: 70, Fold: 22, "4-bet": 8 } : { Fold: 74, Call: 20, "4-bet": 6 };
  } else if (aggro.core === "nit") {
    raw = inRange(hand, "KK+,AKs,AKo") ? { "4-bet": 60, Call: 28, Fold: 12 } : { Fold: 86, Call: 10, "4-bet": 4 };
  } else if (inRange(hand, CALL_3BET) || (aggro.modifiers.includes("overfolder") && inRange(hand, "JJ+,AQs+,AKo"))) {
    raw = { Call: 62, "4-bet": 24, Fold: 14 };
  } else raw = { Fold: 72, Call: 20, "4-bet": 8 };

  applyVillainMix(raw, aggro, "3bet");
  return pack(hand, heroPos, `Facing a 3-bet ${vs}.`, raw);
}

function vsFourBet(hand, heroPos, spot, seats) {
  const vs = vsLine(villainOf(seats, spot.threeBettor), spot.threeBettor);
  const raw = inRange(hand, "KK+,AKs") ? { "All-in": 82, Fold: 18 } : { Fold: 88, Call: 8, "All-in": 4 };
  return pack(hand, heroPos, `4-bet pots stay premium-only. ${vs}.`, raw);
}
