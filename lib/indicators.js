import { evaluateHand } from "./poker";

export const RANK_ORDER = "AKQJT98765432";
export const RANK_VALUE = Object.fromEntries([...RANK_ORDER].map((r, i) => [r, 14 - i]));
export const SUIT_LIST = [
  { value: "s", icon: "♠", name: "Spades" },
  { value: "h", icon: "♥", name: "Hearts" },
  { value: "d", icon: "♦", name: "Diamonds" },
  { value: "c", icon: "♣", name: "Clubs" }
];
export const POSITIONS = ["UTG", "UTG+1", "MP", "LJ", "HJ", "CO", "BTN", "SB", "BB"];
export const LATE_POS = new Set(["HJ", "CO", "BTN"]);
export const BLINDS = new Set(["SB", "BB"]);
export const LIVE_STORAGE_KEY = "hl-live-spot";

const SUITS = ["s", "h", "d", "c"];
export const FULL_DECK = RANK_ORDER.split("").flatMap((r) => SUITS.map((s) => r + s));

export function emptySnapshot() {
  return {
    hole: [null, null],
    board: [null, null, null, null, null],
    heroPos: "BTN",
    stacksBB: 100,
    pot: 0,
    toCall: 0,
    villains: 1
  };
}

export function compactCards(slots) {
  const seen = new Set();
  const out = [];
  for (const c of slots || []) {
    if (!c || c.length < 2 || c === "xx" || seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out;
}

export function holeLabel(hole) {
  if (!hole?.[0] || !hole?.[1]) return null;
  const a = hole[0][0];
  const b = hole[1][0];
  const pair = a === b;
  const suited = hole[0][1] === hole[1][1];
  const [high, low] = RANK_VALUE[a] >= RANK_VALUE[b] ? [a, b] : [b, a];
  if (pair) return `${high}${low}`;
  return `${high}${low}${suited ? "s" : "o"}`;
}

function category(score) {
  if (score < 0) return -1;
  return Math.floor(score / 1e8);
}

function remainingDeck(used) {
  const skip = new Set(used);
  return FULL_DECK.filter((c) => !skip.has(c));
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(parts) {
  let h = 2166136261;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function boardTexture(board) {
  if (!board || board.length < 3) {
    return { wetDry: null, paired: false, suits: null, label: null };
  }
  const ranks = board.map((c) => RANK_VALUE[c[0]]);
  const suits = board.map((c) => c[1]);
  const suitCounts = {};
  for (const s of suits) suitCounts[s] = (suitCounts[s] || 0) + 1;
  const maxSuit = Math.max(...Object.values(suitCounts));
  const suitN = new Set(suits).size;
  const suitsLabel = maxSuit === board.length ? "monotone" : maxSuit >= 3 ? "flushy" : suitN === 2 ? "two-tone" : "rainbow";

  const rankCounts = {};
  for (const r of ranks) rankCounts[r] = (rankCounts[r] || 0) + 1;
  const paired = Object.values(rankCounts).some((n) => n >= 2);

  const uniq = [...new Set(ranks)].sort((a, b) => a - b);
  let gaps = 0;
  for (let i = 1; i < uniq.length; i++) {
    if (uniq[i] - uniq[i - 1] <= 2) gaps += 1;
  }
  if (uniq.includes(14) && uniq.some((r) => r <= 5)) gaps += 1;
  const wet = maxSuit >= 3 || gaps >= 2 || (gaps >= 1 && maxSuit >= 2);
  const wetDry = wet ? "wet" : "dry";
  const bits = [wetDry, paired ? "paired" : null, suitsLabel].filter(Boolean);
  return { wetDry, paired, suits: suitsLabel, label: bits.join(" · ") };
}

export function countOuts(hole, board) {
  if (board.length < 3 || board.length >= 5) return null;
  const current = evaluateHand(hole, board);
  const currentCat = Math.max(0, category(current.score));
  const rest = remainingDeck([...hole, ...board]);
  let count = 0;
  let flush = 0;
  let straight = 0;
  for (const card of rest) {
    const next = evaluateHand(hole, [...board, card]);
    const nextCat = Math.max(0, category(next.score));
    if (nextCat <= currentCat) continue;
    count += 1;
    if (nextCat === 5 && currentCat < 5) flush += 1;
    else if (nextCat === 4 && currentCat < 4) straight += 1;
  }
  const streetsLeft = board.length === 3 ? 2 : 1;
  const approx = Math.min(99, Math.round(count * (streetsLeft === 2 ? 4 : 2)));
  const labels = [];
  if (flush >= 8) labels.push("Flush draw");
  else if (flush >= 6) labels.push("Flush draw");
  if (straight >= 8) labels.push("Open-ender");
  else if (straight >= 3) labels.push("Gutshot");
  if (count >= 12 && !labels.length) labels.push("Strong draw");
  return { count, approx, labels, flush, straight };
}

export function equityVsRandom(hole, board, villains = 1, samples = 280) {
  const v = Math.max(1, Math.min(8, Number(villains) || 1));
  const used = [...hole, ...board];
  const base = remainingDeck(used);
  const need = v * 2 + (5 - board.length);
  if (base.length < need) return null;
  const rng = mulberry32(seedFrom([...hole, ...board, String(v)]));
  let wins = 0;
  let ties = 0;
  const deck = base.slice();
  for (let i = 0; i < samples; i++) {
    shuffleInPlace(deck, rng);
    let idx = 0;
    const fullBoard = board.slice();
    while (fullBoard.length < 5) fullBoard.push(deck[idx++]);
    const hero = evaluateHand(hole, fullBoard).score;
    let bestOpp = -1;
    let ok = true;
    for (let n = 0; n < v; n++) {
      const a = deck[idx++];
      const b = deck[idx++];
      if (!a || !b) {
        ok = false;
        break;
      }
      bestOpp = Math.max(bestOpp, evaluateHand([a, b], fullBoard).score);
    }
    if (!ok) continue;
    if (hero > bestOpp) wins += 1;
    else if (hero === bestOpp) ties += 1;
  }
  const n = wins + ties + (samples - wins - ties);
  if (!n) return null;
  return Math.round(((wins + ties * 0.5) / samples) * 1000) / 10;
}

function cue(snapshot, metrics) {
  const pos = snapshot.heroPos || "BTN";
  if (!metrics.hand) return "Tap your hole cards to start the HUD.";
  if (!metrics.ready) return "Set the pot in BB so SPR and pot odds can calculate.";

  if (metrics.street === "preflop") {
    if (LATE_POS.has(pos)) return "In position — wider continues realize equity more easily.";
    if (BLINDS.has(pos)) return "Out of position — prefer stronger hands and simpler pots.";
    return "Early position — keep the continuing range tighter.";
  }

  if (metrics.spr != null && metrics.spr <= 2.5 && metrics.hand.category >= 1) {
    return `SPR ${metrics.spr} — commit-or-fold territory with a made hand.`;
  }
  if (metrics.spr != null && metrics.spr >= 8) {
    return `SPR ${metrics.spr} — control the pot; implied odds matter more than the label.`;
  }
  if (metrics.outs?.count >= 8 && metrics.gettingPrice) {
    return `${metrics.outs.count} outs — pot odds cover a draw this strong.`;
  }
  if (metrics.outs?.count >= 8 && metrics.need != null && !metrics.gettingPrice) {
    return `${metrics.outs.count} outs, but the price is steep — implied odds have to do extra work.`;
  }
  if (metrics.texture?.wetDry === "wet") {
    return "Wet board — two-pair, sets and strong draws jump in value; one-pair is fragile.";
  }
  if (metrics.texture?.wetDry === "dry" && metrics.hand.category >= 1) {
    return "Dry board — one pair can bet for thin value and protection.";
  }
  if (metrics.street === "river") {
    return "River — no more cards. Showdown value and blockers matter more than draws.";
  }
  return `${metrics.hand.name} — use SPR and pot odds more than the strength label.`;
}

export function indicators(snapshot = {}) {
  const hole = compactCards(snapshot.hole).slice(0, 2);
  const board = compactCards(snapshot.board).slice(0, 5);
  const pot = Math.max(0, Number(snapshot.pot) || 0);
  const toCall = Math.max(0, Number(snapshot.toCall) || 0);
  const stacksBB = Math.max(0, Number(snapshot.stacksBB) || 0);
  const villains = Math.max(1, Math.min(8, Number(snapshot.villains) || 1));
  const ready = hole.length === 2 && pot > 0;
  const street = board.length >= 5 ? "river" : board.length === 4 ? "turn" : board.length === 3 ? "flop" : "preflop";

  const empty = {
    ready: false,
    street,
    hand: null,
    potOdds: null,
    need: null,
    spr: null,
    outs: null,
    equity: null,
    texture: boardTexture(board),
    gettingPrice: null,
    freePlay: toCall === 0,
    cue: hole.length === 2 ? "Set the pot in BB so SPR and pot odds can calculate." : "Tap your hole cards to start the HUD."
  };

  if (hole.length < 2) return empty;

  const label = holeLabel(hole);
  let hand = {
    name: label,
    category: 0,
    raw: null
  };
  if (board.length >= 3) {
    const ev = evaluateHand(hole, board);
    hand = {
      name: ev.score < 0 ? label : ev.name,
      category: Math.max(0, category(ev.score)),
      raw: ev
    };
  }

  const texture = boardTexture(board);
  const outs = countOuts(hole, board);
  if (outs?.labels?.length && board.length >= 3 && board.length < 5) {
    hand = { ...hand, name: `${hand.name} · ${outs.labels.join(" · ")}` };
  }

  const equity = equityVsRandom(hole, board, villains);
  const spr = pot > 0 && stacksBB > 0 ? Math.round((stacksBB / pot) * 10) / 10 : null;
  const potOdds =
    toCall > 0
      ? {
          percent: Math.round((toCall / (pot + toCall)) * 1000) / 10,
          ratio: Math.round((pot / toCall) * 10) / 10
        }
      : null;
  const need = potOdds ? potOdds.percent : null;
  const compare = equity != null ? equity : outs?.approx ?? null;
  const gettingPrice = need == null || compare == null ? null : compare + 0.05 >= need;

  const metrics = {
    ready,
    street,
    hand,
    potOdds: ready ? potOdds : null,
    need: ready ? need : null,
    spr: ready ? spr : null,
    outs: ready ? outs : null,
    equity: ready ? equity : null,
    texture,
    gettingPrice: ready ? gettingPrice : null,
    freePlay: toCall === 0,
    villains
  };
  metrics.cue = cue({ ...snapshot, heroPos: snapshot.heroPos }, metrics);
  return metrics;
}
