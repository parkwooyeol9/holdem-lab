import { holeLabel } from "./indicators";
import { POS_6, emptyTable } from "./villains";
import { normalizeMix, recommend } from "./preflop";

const POS_MAP = {
  UTG: "UTG",
  "UTG+1": "UTG",
  Hijack: "HJ",
  Cutoff: "CO",
  Button: "BTN",
  "Small Blind": "SB",
  "Big Blind": "BB"
};

const PRESSURE = {
  "Chip EV / early stage": 0,
  "Regular payout pressure": 0.4,
  "Bubble / major pay jump": 0.75,
  "Satellite survival pressure": 0.92
};

function toPos(label) {
  return POS_MAP[label] || label;
}

function toCode(card) {
  return `${card.rank}${card.suit}`;
}

function mapAction(action, level) {
  const token = String(action || "").toLowerCase();
  if (token === "fold") return "fold";
  if (token === "check") return level < 2 ? "limp" : "call";
  if (token === "call") return level < 2 ? "limp" : "call";
  if (token === "open" || token === "bet") return "open";
  if (token === "raise" || token === "check-raise" || token === "all-in") {
    if (level < 2) return "open";
    if (level === 2) return "3bet";
    return "4bet";
  }
  return "";
}

function kqsJam(form, hand) {
  const btn = form.actions.find((a) => a.position === "Button" && a.action === "Open");
  const sb = form.actions.find((a) => a.position === "Small Blind" && a.action === "All-in");
  return form.street === "Preflop" && (hand === "KQs" || hand === "QKs") && btn && sb && form.heroPos === "Big Blind";
}

export function analyzeHand(form) {
  const heroPos = toPos(form.heroPos);
  const hole = [toCode(form.heroCards[0]), toCode(form.heroCards[1])];
  const hand = holeLabel(hole);
  const actions = Object.fromEntries(POS_6.map((pos) => [pos, ""]));
  const heroIdx = POS_6.indexOf(heroPos);
  let level = 0;
  for (const row of form.actions || []) {
    const pos = toPos(row.position);
    const idx = POS_6.indexOf(pos);
    if (idx < 0 || idx >= heroIdx) continue;
    const mapped = mapAction(row.action, level);
    if (!mapped) continue;
    actions[pos] = mapped;
    if (mapped === "limp") level = Math.max(level, 1);
    if (mapped === "open") level = Math.max(level, 2);
    if (mapped === "3bet") level = Math.max(level, 3);
    if (mapped === "4bet") level = Math.max(level, 4);
  }

  for (const pos of POS_6.slice(0, heroIdx)) {
    if (!actions[pos]) actions[pos] = "fold";
  }

  const stack = Number(form.heroStack) || 100;
  const rec = recommend({ hole, heroPos, actions, seats: emptyTable(), stackBB: stack });
  const pressureW = PRESSURE[form.pressure] ?? 0;
  const icmW = pressureW * Math.max(0, Math.min(1, (35 - stack) / 25));
  let mix = rec.mix.slice();
  if (icmW > 0 && mix.length) {
    const raw = Object.fromEntries(mix.map((m) => [m.label, m.pct]));
    raw.Fold = (raw.Fold || 0) + 22 * icmW;
    if (raw["All-in"] != null) raw["All-in"] = Math.max(3, raw["All-in"] - 16 * icmW);
    if (raw["4-bet"] != null) raw["4-bet"] = Math.max(3, raw["4-bet"] - 10 * icmW);
    if (raw.Raise != null) raw.Raise = Math.max(5, raw.Raise - 10 * icmW);
    if (raw["3-bet"] != null) raw["3-bet"] = Math.max(4, raw["3-bet"] - 8 * icmW);
    mix = normalizeMix(raw);
  }

  const preferred = mix[0]?.label || rec.action;
  const preferredPct = mix[0]?.pct || 0;
  const jamCase = kqsJam(form, hand);
  const score = Math.max(8, Math.min(96, Math.round(preferredPct * (1 - 0.18 * icmW))));
  const confidence = rec.source === "pokerbench" && rec.benchN >= 8 ? "High" : rec.source === "pokerbench" ? "Medium" : jamCase ? "Medium" : "Low";

  const columns = [
    {
      title: "Preferred mix",
      tone: "value",
      items: mix.slice(0, 3).map((m) => `${m.label} ${m.pct}%`)
    },
    {
      title: rec.equity ? `Equity vs ${rec.equity.vs}` : "Equity",
      tone: "draw",
      items: rec.equity
        ? [`${rec.equity.pct}% chip EV`, rec.equity.combos ? `${rec.equity.combos} rival combos` : "vs random remainder", `${rec.equity.samples} Monte Carlo samples`]
        : ["Need hole cards", "Range equity needs an opponent line", "Random remainder used as fallback"]
    },
    {
      title: icmW > 0 ? "ICM overlay" : "Data weight",
      tone: "bluff",
      items: icmW > 0
        ? [
            `ICM weight ${Math.round(icmW * 100)}%`,
            `Hero stack ${stack}BB`,
            "Payouts still unknown — treat as a penalty, not a solve"
          ]
        : [
            rec.source === "pokerbench" ? `PokerBench n=${rec.benchN}${rec.benchTable ? ` · ${rec.benchTable}` : ""}` : "Chart prior (thin PokerBench node)",
            `${Math.round((rec.solverWeight || 0) * 100)}% solver weight`,
            stack < 40 ? `Short-stack overlay at ${stack}BB` : "100bb cash labels; tournaments can differ"
          ]
    }
  ];

  if (jamCase && preferred !== "Fold") {
    columns[0].items.unshift("Short-stack jam: isolation all-in is the usual chip-EV default");
  }

  return {
    score,
    verdict: icmW > 0.15 ? `${preferred} is still the cash default; ICM can make folding close` : `${preferred} is the preferred action`,
    confidence,
    explanation: rec.reason,
    columns,
    conclusion: rec.headline,
    missing: icmW > 0 ? ["Exact payouts", "Antes", "Full stack distribution"] : rec.source === "pokerbench" ? ["Bet sizing", "Player HUD"] : ["Matching PokerBench node", "Bet sizing", "Player HUD"]
  };
}
