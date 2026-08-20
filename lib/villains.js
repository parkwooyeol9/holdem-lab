export const POS_6 = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
export const SEAT_COUNT = 6;
export const HERO_SEAT = 0;
export const CLOCKWISE_FROM_BTN = ["BTN", "SB", "BB", "UTG", "HJ", "CO"];

export const ARCHETYPES = [
  { id: "nit", label: "Nit", hint: "Tight-passive" },
  { id: "tag", label: "TAG", hint: "Tight-aggressive" },
  { id: "lag", label: "LAG", hint: "Loose-aggressive" },
  { id: "fish", label: "Fish", hint: "Wide and weak" },
  { id: "lp", label: "Loose Passive", hint: "Calls too much" },
  { id: "maniac", label: "Maniac", hint: "Raises everything" },
  { id: "overfolder", label: "Overfolder", hint: "Folds to pressure" },
  { id: "overcaller", label: "Overcaller", hint: "Doesn't fold" }
];

export const STAT_FIELDS = [
  { key: "vpip", label: "VPIP" },
  { key: "pfr", label: "PFR" },
  { key: "threeBet", label: "3-bet" },
  { key: "foldTo3bet", label: "Fold to 3-bet" },
  { key: "cbet", label: "C-bet" },
  { key: "foldToCbet", label: "Fold to c-bet" },
  { key: "steal", label: "Steal" },
  { key: "checkRaise", label: "Check/raise" },
  { key: "wtsd", label: "WTSD" },
  { key: "wsd", label: "W$SD" }
];

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
  return (buttonSeat - 1 + SEAT_COUNT) % SEAT_COUNT;
}

export function num(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function gte(value, n) {
  return value != null && value >= n;
}

function lte(value, n) {
  return value != null && value <= n;
}

export function parseStats(seat) {
  return Object.fromEntries(STAT_FIELDS.map((f) => [f.key, num(seat?.stats?.[f.key])]));
}

function modifierLabel(modifiers) {
  return modifiers
    .map((id) => ARCHETYPES.find((a) => a.id === id)?.label)
    .filter(Boolean)
    .join(" · ");
}

export function classify(seat) {
  const s = parseStats(seat);
  const filled = STAT_FIELDS.filter((f) => s[f.key] != null).length;
  if (filled === 0) {
    return { core: "unknown", modifiers: [], confidence: "none", label: "Unknown", filled: 0 };
  }

  const vpip = s.vpip;
  const pfr = s.pfr;
  const gap = vpip != null && pfr != null ? vpip - pfr : null;
  const modifiers = [];

  if (gte(s.foldTo3bet, 70) || gte(s.foldToCbet, 65) || lte(s.wtsd, 20)) modifiers.push("overfolder");
  if (lte(s.foldTo3bet, 38) || lte(s.foldToCbet, 28) || gte(s.wtsd, 36)) modifiers.push("overcaller");
  if (lte(s.wsd, 46) && (gte(s.wtsd, 32) || lte(s.foldToCbet, 30))) {
    if (!modifiers.includes("overcaller")) modifiers.push("overcaller");
  }

  let core = "tag";
  if (gte(vpip, 48) && (gte(pfr, 28) || gte(s.threeBet, 12) || gte(s.steal, 50))) core = "maniac";
  else if (gte(vpip, 38) && (gte(gap, 14) || lte(pfr, 18) || lte(s.threeBet, 3.5))) core = "fish";
  else if (gte(vpip, 30) && lte(pfr, 13)) core = "lp";
  else if ((gte(vpip, 26) && gte(pfr, 20)) || gte(s.threeBet, 9) || gte(s.steal, 42) || gte(s.cbet, 82)) core = "lag";
  else if (lte(vpip, 14) || (lte(s.steal, 18) && lte(vpip, 18))) core = "nit";
  else core = "tag";

  if (gte(s.checkRaise, 14) && core === "nit") core = "tag";

  const uniq = [...new Set(modifiers)].filter((m) => m !== core);
  const coreLabel = ARCHETYPES.find((a) => a.id === core)?.label || "TAG";
  return {
    core,
    modifiers: uniq,
    confidence: "stats",
    label: uniq.length ? `${coreLabel} · ${modifierLabel(uniq)}` : coreLabel,
    filled,
    stats: s
  };
}

export function hasRead(seat) {
  return classify(seat).confidence !== "none";
}

export function isLoose(read) {
  return ["fish", "lp", "lag", "maniac"].includes(read?.core);
}

export function isPassive(read) {
  return ["fish", "lp", "nit"].includes(read?.core) || read?.modifiers?.includes("overcaller");
}
