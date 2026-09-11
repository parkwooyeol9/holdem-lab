import data from "./data/pokerbench-spots.json" with { type: "json" };

const SUIT = { s: "♠", h: "♥", d: "♦", c: "♣" };
const POST_ORDER = ["SB", "BB", "UTG", "HJ", "CO", "BTN"];
const POS_NAME = {
  UTG: "UTG",
  HJ: "Hijack",
  CO: "Cutoff",
  BTN: "Button",
  SB: "Small Blind",
  BB: "Big Blind",
  IP: "In Position",
  OOP: "Out of Position"
};

export const SOURCE = data.meta;
export const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

export function prettyCards(code) {
  if (!code) return [];
  const out = [];
  for (let i = 0; i + 1 < code.length; i += 2) {
    const rank = code[i];
    const suit = SUIT[code[i + 1]] || code[i + 1];
    out.push(`${rank}${suit}`);
  }
  return out;
}

export function prettyPos(pos) {
  return POS_NAME[pos] || pos || "Hero";
}

function prettySize(token) {
  const match = String(token).trim().match(/^(\d+(?:\.\d+)?)bb$/i);
  if (!match) return null;
  return String(Number(match[1]));
}

export function prettyAction(token, { unopened = false, heroPos = "" } = {}) {
  const raw = String(token).trim();
  const low = raw.toLowerCase();
  if (low === "fold") return "Fold";
  if (low === "call") return "Call";
  if (low === "check") return "Check";
  if (low === "allin" || low === "all-in") return "All-in";
  const size = prettySize(raw);
  if (size != null) {
    if (unopened && heroPos !== "BB") return `Open ${size}bb`;
    return `Raise ${size}bb`;
  }
  const sized = raw.match(/^(bet|raise)\s+(\d+)/i);
  if (sized) {
    const kind = sized[1][0].toUpperCase() + sized[1].slice(1).toLowerCase();
    return `${kind} ${sized[2]}bb`;
  }
  return raw.replace(/^\w/, (c) => c.toUpperCase());
}

export function actionFamily(label) {
  const token = String(label).toLowerCase();
  if (token.includes("fold")) return "fold";
  if (token.includes("check")) return "check";
  if (token.includes("call")) return "call";
  if (token.includes("all-in") || token.includes("allin") || token.includes("jam")) return "allin";
  if (token.includes("open") || token.includes("raise")) return "raise";
  if (token.includes("bet")) return "bet";
  if (/\d/.test(token)) return "raise";
  return token;
}

export function gradeChoice(spot, choice) {
  if (!spot || !choice) return { grade: "review", ok: false, frequency: 0, evLoss: 0 };
  if (choice === spot.a) return { grade: "optimal", ok: true, frequency: 100, evLoss: 0 };
  const family = actionFamily(choice);
  if (family === actionFamily(spot.a) && family !== "fold") {
    return { grade: "close", ok: true, frequency: 50, evLoss: 0 };
  }
  return { grade: "review", ok: false, frequency: 0, evLoss: 0 };
}

function formatPreflopVerb(act, hadRaise) {
  const low = String(act).toLowerCase();
  if (low === "fold") return "folds";
  if (low === "call") return "calls";
  if (low === "check") return "checks";
  if (low === "allin" || low === "all-in") return "jams";
  const size = prettySize(low);
  if (size != null) return hadRaise ? `raises to ${size}bb` : `opens ${size}bb`;
  return String(act);
}

export function formatPreflopLine(line) {
  if (!line) return "Folded to hero";
  const parts = String(line).split("/").filter(Boolean);
  const bits = [];
  let hadRaise = false;
  for (let i = 0; i + 1 < parts.length; i += 2) {
    bits.push(`${prettyPos(parts[i])} ${formatPreflopVerb(parts[i + 1], hadRaise)}`);
    const low = String(parts[i + 1]).toLowerCase();
    if (low.endsWith("bb") || low === "allin" || low === "all-in") hadRaise = true;
  }
  return bits.join(" · ") || "Folded to hero";
}

function formatPostflopToken(token) {
  if (token === "dealcards" || /^[AKQJT2-9][shdc]$/i.test(token)) return null;
  const match = String(token).match(/^(OOP|IP)_(CHECK|CALL|FOLD|BET|RAISE)_?(\d+)?$/i);
  if (!match) return String(token).replace(/_/g, " ");
  const who = match[1].toUpperCase();
  const act = match[2].toLowerCase();
  const n = match[3];
  if (act === "check") return `${who} checks`;
  if (act === "call") return `${who} calls`;
  if (act === "fold") return `${who} folds`;
  if (act === "bet") return `${who} bets ${n}bb`;
  if (act === "raise") return `${who} raises to ${n}bb`;
  return token;
}

export function formatPostflopLine(preflop, postflop) {
  const pre = formatPreflopLine(preflop);
  const bits = [];
  for (const token of String(postflop || "").split("/").filter(Boolean)) {
    const bit = formatPostflopToken(token);
    if (bit) bits.push(bit);
  }
  return bits.length ? `${pre} · ${bits.join(" · ")}` : pre;
}

function lastBit(text) {
  const bits = String(text)
    .split(" · ")
    .map((part) => part.trim())
    .filter(Boolean);
  return bits[bits.length - 1] || text;
}

function liveSeats(line) {
  const parts = String(line || "").split("/").filter(Boolean);
  const last = {};
  for (let i = 0; i + 1 < parts.length; i += 2) last[parts[i]] = parts[i + 1];
  return Object.keys(last).filter((pos) => String(last[pos]).toLowerCase() !== "fold");
}

function resolveSeat(line, hp) {
  const live = liveSeats(line);
  const ordered = POST_ORDER.filter((pos) => live.includes(pos));
  if (hp === "OOP") return ordered[0] || hp;
  if (hp === "IP") return ordered[ordered.length - 1] || hp;
  return hp;
}

function prettyPot(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const shown = Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
  return `${shown} BB`;
}

function preflopTitle(row) {
  const pos = prettyPos(row.pos);
  if (!row.line) return `Raise first in · ${pos}`;
  if (/^SB\/call$/i.test(row.line)) return `Vs SB limp · ${pos}`;
  if (row.bets >= 4) return `5-bet+ pot · ${pos}`;
  if (row.bets === 3) return `4-bet pot · ${pos}`;
  if (row.bets === 2) return `3-bet pot · ${pos}`;
  return `Facing a raise · ${pos}`;
}

function whyFor(spot) {
  return `${spot.source} prefers ${spot.a} in this 6-max 100bb cash node. PokerBench stores the solver’s highest-frequency action, not mixed frequencies or an EV table.`;
}

function cueFor(spot) {
  if (spot.street === "preflop") {
    if (!spot.lineRaw) return "First-in: compare this holding to a standard 6-max opening chart for your seat.";
    if (spot.bets >= 2) return "The pot is already 3-bet or higher. Continuing ranges polarize; dominated hands usually fold.";
    return "Facing a raise: fold, continue, or 3-bet. The opener’s seat matters more than the raw hand rank.";
  }
  if (spot.street === "flop") return "Later streets are hidden on purpose. Texture, SPR and who took the preflop lead drive this node.";
  if (spot.street === "turn") return "Ranges have narrowed. Decide whether this hand is value, a bluff-catcher, or a fold.";
  return "No more cards. Blockers and the betting line decide thin calls and value bets.";
}

function inflatePreflop(row) {
  const unopened = !row.line || row.bets === 0;
  const moves = row.m.map((move) => prettyAction(move, { unopened, heroPos: row.pos }));
  const answer = prettyAction(row.a, { unopened, heroPos: row.pos });
  const line = formatPreflopLine(row.line);
  const spot = {
    id: row.id,
    street: "preflop",
    level: "PREFLOP",
    source: SOURCE.preflop,
    dataset: SOURCE.name,
    spot: preflopTitle(row),
    pos: prettyPos(row.pos),
    heroPos: row.pos,
    villain: lastBit(line),
    cards: prettyCards(row.h),
    board: [],
    pot: prettyPot(row.pot),
    q: "What is the solver’s preferred action?",
    a: answer,
    moves,
    line,
    lineRaw: row.line || "",
    bets: row.bets,
    players: row.n,
    why: "",
    cue: ""
  };
  spot.why = whyFor(spot);
  spot.cue = cueFor(spot);
  return spot;
}

function inflatePostflop(row) {
  const street = String(row.st).toLowerCase();
  const heroSeat = resolveSeat(row.pf, row.hp);
  const line = formatPostflopLine(row.pf, row.pa);
  const moves = row.m.map((move) => prettyAction(move));
  const answer = prettyAction(row.a);
  const spot = {
    id: row.id,
    street,
    level: String(row.st).toUpperCase(),
    source: SOURCE.postflop,
    dataset: SOURCE.name,
    spot: `${row.st} decision · ${prettyPos(heroSeat)} (${row.hp})`,
    pos: `${prettyPos(heroSeat)} · ${row.hp}`,
    heroPos: heroSeat,
    villain: lastBit(formatPostflopLine("", row.pa)),
    cards: prettyCards(row.h),
    board: prettyCards((row.b || []).join("")),
    pot: prettyPot(row.pot),
    q: "What is the solver’s preferred action?",
    a: answer,
    moves,
    line,
    lineRaw: row.pa || "",
    bets: 0,
    players: 2,
    why: "",
    cue: ""
  };
  spot.why = whyFor(spot);
  spot.cue = cueFor(spot);
  return spot;
}

export const SPOTS = [...data.preflop.map(inflatePreflop), ...data.postflop.map(inflatePostflop)];

const STREET_COPY = {
  preflop: ["6-max RFI, 3-bets and 4-bet pots from GTOWizard.", ["Position", "Opening ranges", "3-bets"]],
  flop: ["WASM-Postflop flop nodes with later cards hidden.", ["Board texture", "C-bets", "Draws"]],
  turn: ["Turn barrels, raises and bluff-catchers from solved trees.", ["Barrels", "Blockers", "Sizing"]],
  river: ["River value bets, jams and thin calls with no more cards.", ["Showdown", "Blockers", "Polar sizing"]]
};

export const MODULES = ["preflop", "flop", "turn", "river"].map((id) => ({
  id,
  name: id === "preflop" ? "Preflop" : id[0].toUpperCase() + id.slice(1),
  count: SPOTS.filter((spot) => spot.street === id).length,
  blurb: STREET_COPY[id][0],
  tags: STREET_COPY[id][1]
}));

export const DRILL_POOLS = ["all", "preflop", "flop", "turn", "river", "bb-defend", "btn-steal", "vs-open", "3bet"];

export const MODULE_TAGS = {
  preflop: ["t0", "t1", "t2"],
  flop: ["t3", "t4", "t5"],
  turn: ["t6", "t7", "t8"],
  river: ["t9", "t7", "t10"]
};

function matchesPool(spot, poolKey) {
  if (!poolKey || poolKey === "all") return true;
  if (poolKey === "preflop" || poolKey === "flop" || poolKey === "turn" || poolKey === "river") return spot.street === poolKey;
  if (poolKey === "bb") return spot.heroPos === "BB";
  if (poolKey === "bb-defend") return spot.street === "preflop" && spot.heroPos === "BB" && (spot.bets || 0) >= 1;
  if (poolKey === "btn-steal") return spot.street === "preflop" && ["CO", "BTN", "SB"].includes(spot.heroPos) && (spot.bets || 0) === 0;
  if (poolKey === "vs-open") return spot.street === "preflop" && spot.bets === 1;
  if (poolKey === "3bet") return spot.street === "preflop" && (spot.bets || 0) >= 2;
  return false;
}

export function indicesFor(poolKey = "all") {
  return SPOTS.map((spot, i) => (matchesPool(spot, poolKey) ? i : -1)).filter((i) => i >= 0);
}

export function sampleIndices(pool, n = 5) {
  const arr = pool.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(n, arr.length));
}

export function safeSpot(index) {
  return SPOTS[index] || SPOTS[0];
}
