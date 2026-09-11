export const POS_6 = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
export const SEAT_COUNT = 6;
export const HERO_SEAT = 0;

// Three separate 6-max clocks — do not mix them.
// 1) Seat ring / dealer disc: left from hero, D moves one seat this way.
export const CLOCKWISE_FROM_BTN = ["BTN", "SB", "BB", "UTG", "HJ", "CO"];
// 2) A seated player's label after each hand (inverse of the disc).
export const HERO_ORBIT = ["BTN", "CO", "HJ", "UTG", "BB", "SB"];
// 3) Action order.
export const PREFLOP_ORDER = POS_6;
export const POSTFLOP_ORDER = ["SB", "BB", "UTG", "HJ", "CO", "BTN"];
export const FLOP_ORDER = POSTFLOP_ORDER;

export const ARCHETYPES = [
  { id: "nit", label: "Nit", hint: "Tight-passive", exploit: "스틸과 3벳으로 팟을 가져가세요. 이 상대의 벳은 강한 핸드로만 콜합니다." },
  { id: "tag", label: "TAG", hint: "Tight-aggressive", exploit: "정석 레인지로 싸워도 됩니다. 얇은 블러프보다 포지션과 핸드 우위를 챙기세요." },
  { id: "lag", label: "LAG", hint: "Loose-aggressive", exploit: "라이트 콜을 늘리고, 상대 레이즈는 더 강한 레인지로 보세요." },
  { id: "fish", label: "Fish", hint: "Wide and weak", exploit: "블러프는 줄이고 밸류벳을 크게. 핸드를 접지 말고 쇼다운까지 가세요." },
  { id: "lp", label: "Loose Passive", hint: "Calls too much", exploit: "밸류를 얇게라도 베팅하세요. 폴드가 없으니 블러프는 거의 하지 마세요." },
  { id: "maniac", label: "Maniac", hint: "Raises everything", exploit: "강한 핸드로 콜다운하세요. 약한 핸드로 리레이즈 워를 하지 마세요." },
  { id: "overfolder", label: "Overfolder", hint: "Folds to pressure", exploit: "벳과 레이즈를 더 자주 해서 폴드 에쿼티를 챙기세요." },
  { id: "overcaller", label: "Overcaller", hint: "Doesn't fold", exploit: "블러프를 끄고 밸류벳만 크게 하세요. 잘 안 죽습니다." }
];

export const STAT_FIELDS = [
  { key: "vpip", label: "VPIP", what: "프리플롭에서 팟에 칩을 넣은 비율", rule: "≤14 Nit · 15–27 TAG · 28–37 LAG · ≥38 Fish/Maniac" },
  { key: "pfr", label: "PFR", what: "프리플롭에서 레이즈한 비율", rule: "VPIP와 비슷하면 공격적(TAG/LAG). 차이(갭)가 크면 Fish/Loose Passive" },
  { key: "threeBet", label: "3-bet", what: "상대 오픈에 리레이즈한 비율", rule: "≤3.5 패시브/피쉬 · 4–9 TAG · ≥10 LAG · ≥12 Maniac 후보" },
  { key: "foldTo3bet", label: "Fold to 3-bet", what: "3벳을 당했을 때 접는 비율", rule: "≥70 Overfolder · ≤36 Overcaller. 높으면 라이트 3벳, 낮으면 밸류 3벳" },
  { key: "cbet", label: "C-bet", what: "오픈한 뒤 플롭에서 계속 벳하는 비율", rule: "혼자 높다고 LAG가 되진 않음. ≥82이고 VPIP도 높으면 공격형" },
  { key: "foldToCbet", label: "Fold to c-bet", what: "플롭 C-bet에 접는 비율", rule: "≥65 Overfolder · ≤30 Overcaller. 높으면 C-bet 블러프, 낮으면 밸류만" },
  { key: "steal", label: "Steal", what: "CO/BTN/SB에서 오픈하는 비율", rule: "≤18 Nit · 평균 32–40 TAG · ≥44 LAG · ≥50 Maniac 후보" },
  { key: "checkRaise", label: "Check/raise", what: "체크 후 상대 벳에 레이즈하는 비율", rule: "≥14이면 Nit가 아니라 TAG 쪽으로. 높으면 체크레이즈 블러프를 줄이세요" },
  { key: "wtsd", label: "WTSD", what: "플롭을 본 뒤 쇼다운까지 가는 비율", rule: "≤22 Overfolder · ≥38 Overcaller. 낮으면 압력, 높으면 밸류 다운" },
  { key: "wsd", label: "W$SD", what: "쇼다운에 가서 팟을 이기는 비율", rule: "낮고(≤42) WTSD가 높으면 약한 핸드로 콜하는 Overcaller" }
];

const POP = {
  vpip: [24, 8],
  pfr: [19, 6],
  threeBet: [7.5, 3],
  foldTo3bet: [55, 12],
  cbet: [55, 12],
  foldToCbet: [45, 12],
  steal: [32, 10],
  checkRaise: [8, 4],
  wtsd: [26, 6],
  wsd: [52, 8]
};

export function emptyStats() {
  return Object.fromEntries(STAT_FIELDS.map((f) => [f.key, ""]));
}

export function emptySeat(pos) {
  return { pos, stats: emptyStats() };
}

export function emptySeats() {
  return Array.from({ length: SEAT_COUNT }, (_, id) => ({ id, stats: emptyStats() }));
}

export function emptyTable() {
  return Object.fromEntries(POS_6.map((pos) => [pos, emptySeat(pos)]));
}

export function positionOf(seat, buttonSeat) {
  return CLOCKWISE_FROM_BTN[(seat - buttonSeat + SEAT_COUNT) % SEAT_COUNT];
}

export function seatOfPosition(pos, buttonSeat) {
  const offset = CLOCKWISE_FROM_BTN.indexOf(pos);
  return (buttonSeat + Math.max(0, offset)) % SEAT_COUNT;
}

export function heroPosition(buttonSeat, heroSeat = HERO_SEAT) {
  return positionOf(heroSeat, buttonSeat);
}

export function buttonForHeroPosition(heroPos, heroSeat = HERO_SEAT) {
  const offset = CLOCKWISE_FROM_BTN.indexOf(heroPos);
  return (heroSeat - Math.max(0, offset) + SEAT_COUNT) % SEAT_COUNT;
}

export function advanceButton(buttonSeat) {
  return (buttonSeat + 1) % SEAT_COUNT;
}

export function num(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseStats(seat) {
  return Object.fromEntries(STAT_FIELDS.map((f) => [f.key, num(seat?.stats?.[f.key])]));
}

function zscore(s, key) {
  const v = s[key];
  if (v == null) return 0;
  const [mean, sd] = POP[key];
  return (v - mean) / sd;
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function modifierLabel(modifiers) {
  return modifiers
    .map((id) => ARCHETYPES.find((a) => a.id === id)?.label)
    .filter(Boolean)
    .join(" · ");
}

const COMBO_EXPLOIT = {
  "lag+overcaller": "블러프는 접고 밸류만 크게 베팅하세요. 레이즈에도 잘 안 죽으니 강한 핸드로 스택을 넣습니다.",
  "lag+overfolder": "라이트 3벳과 플롭 벳으로 팟을 뺏으세요. 압력에 쉽게 접습니다.",
  "fish+overcaller": "블러프 금지, 밸류벳을 키우세요. 약한 핸드로도 콜을 많이 합니다.",
  "lp+overcaller": "밸류벳만 하고 블러프는 하지 마세요. 콜 스테이션입니다.",
  "nit+overfolder": "스틸과 3벳을 늘리세요. 싸움 없이 팟을 포기하는 편입니다.",
  "tag+overcaller": "블러프를 줄이고 밸류를 두껍게. TAG라도 콜은 넓은 편입니다.",
  "tag+overfolder": "C-bet과 스틸을 조금 더 넓히세요. 폴드 에쿼티가 평균보다 큽니다.",
  "maniac+overcaller": "강한 핸드로만 콜다운하세요. 상대는 거의 안 접고 계속 칩을 넣습니다."
};

export function exploitLine(read) {
  if (!read || read.core === "unknown") {
    return "HUD 숫자를 넣으면 이 상대를 어떻게 공략할지 한 줄로 알려 줍니다.";
  }
  const mods = read.modifiers || [];
  for (const mod of mods) {
    const combo = COMBO_EXPLOIT[`${read.core}+${mod}`];
    if (combo) return combo;
  }
  const core = ARCHETYPES.find((a) => a.id === read.core)?.exploit;
  const extra = ARCHETYPES.find((a) => a.id === mods[0])?.exploit;
  if (core && extra && mods[0]) return `${core} ${extra}`;
  return core || extra || "";
}

export function classify(seat) {
  const s = parseStats(seat);
  const filled = STAT_FIELDS.filter((f) => s[f.key] != null).length;
  if (filled === 0) {
    return {
      core: "unknown",
      modifiers: [],
      confidence: "none",
      label: "Unknown",
      filled: 0,
      traits: { looseness: 0.5, aggression: 0.5, overfold: 0.5, overcall: 0.5 },
      stats: s,
      exploit: exploitLine({ core: "unknown" })
    };
  }

  const vpip = s.vpip;
  const pfr = s.pfr;
  const gap = vpip != null && pfr != null ? vpip - pfr : null;
  const z = (key) => zscore(s, key);

  const looseness = sigmoid(z("vpip") * 1.15 + (gap != null ? (gap - 5) / 10 : 0) * 0.35);
  const aggression = sigmoid(z("pfr") * 0.7 + z("threeBet") * 0.85 + z("steal") * 0.45 + z("cbet") * 0.25);
  const overfold = sigmoid(z("foldTo3bet") * 0.85 + z("foldToCbet") * 0.45 - z("wtsd") * 0.55);
  const overcall = sigmoid(-z("foldTo3bet") * 0.7 - z("foldToCbet") * 0.35 + z("wtsd") * 0.6 - z("wsd") * 0.25);

  const scores = {
    nit: -z("vpip") * 1.2 - z("pfr") * 0.8 - z("steal") * 0.6 - z("threeBet") * 0.4,
    tag: -Math.abs(z("vpip")) * 0.7 - Math.abs(z("pfr")) * 0.5 + aggression * 0.4 - Math.abs(looseness - 0.42) * 0.8,
    lag: z("vpip") * 0.6 + z("pfr") * 0.9 + z("threeBet") * 1.1 + z("steal") * 0.7,
    fish: z("vpip") * 1.1 + (gap != null ? gap / 8 : 0) - z("pfr") * 0.5 - z("threeBet") * 0.4,
    lp: z("vpip") * 0.8 - z("pfr") * 1.1 - z("threeBet") * 0.8 + overcall * 0.6,
    maniac: z("vpip") * 0.9 + z("pfr") * 1.0 + z("threeBet") * 0.9 + z("steal") * 0.8
  };

  if (vpip != null && vpip >= 48) scores.maniac += 1.4;
  if (vpip != null && vpip <= 14) scores.nit += 1.2;
  if (gap != null && gap >= 14) scores.fish += 0.8;

  let core = "tag";
  let best = -Infinity;
  for (const [id, score] of Object.entries(scores)) {
    if (score > best) {
      best = score;
      core = id;
    }
  }

  const modifiers = [];
  if (overfold >= 0.62) modifiers.push("overfolder");
  if (overcall >= 0.62) modifiers.push("overcaller");
  const uniq = [...new Set(modifiers)].filter((m) => m !== core);
  const coreLabel = ARCHETYPES.find((a) => a.id === core)?.label || "TAG";
  const confidence = filled >= 6 ? "high" : filled >= 3 ? "medium" : "low";
  const result = {
    core,
    modifiers: uniq,
    confidence,
    label: uniq.length ? `${coreLabel} · ${modifierLabel(uniq)}` : coreLabel,
    filled,
    stats: s,
    traits: {
      looseness: clamp(looseness, 0.05, 0.95),
      aggression: clamp(aggression, 0.05, 0.95),
      overfold: clamp(overfold, 0.05, 0.95),
      overcall: clamp(overcall, 0.05, 0.95)
    },
    scores
  };
  result.exploit = exploitLine(result);
  return result;
}

export function hasRead(seat) {
  return classify(seat).confidence !== "none";
}

export function isLoose(read) {
  if (!read || read.core === "unknown") return false;
  if (read.traits?.looseness >= 0.62) return true;
  return ["fish", "lp", "lag", "maniac"].includes(read.core);
}

export function isPassive(read) {
  if (!read || read.core === "unknown") return false;
  if (read.traits?.aggression <= 0.4 && read.traits?.overcall >= 0.55) return true;
  return ["fish", "lp", "nit"].includes(read.core) || read.modifiers?.includes("overcaller");
}

export function rangeWidth(read) {
  if (!read || read.confidence === "none") return "base";
  const loose = read.traits?.looseness ?? 0.5;
  if (loose >= 0.68 || read.core === "fish" || read.core === "maniac") return "wide";
  if (loose <= 0.38 || read.core === "nit") return "tight";
  return "base";
}
