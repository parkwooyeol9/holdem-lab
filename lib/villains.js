export const POS_6 = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];

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
  { key: "wtsd", label: "WTSD" }
];

export function emptySeat(pos) {
  return {
    pos,
    tag: null,
    stats: { vpip: "", pfr: "", threeBet: "", foldTo3bet: "", wtsd: "" }
  };
}

export function emptyTable() {
  return Object.fromEntries(POS_6.map((pos) => [pos, emptySeat(pos)]));
}

function num(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function classify(seat) {
  if (!seat) return { core: "unknown", modifiers: [], confidence: "none", label: "Unknown" };

  if (seat.tag) {
    const meta = ARCHETYPES.find((a) => a.id === seat.tag);
    const modifiers = seat.tag === "overfolder" || seat.tag === "overcaller" ? [seat.tag] : [];
    const core = modifiers.length ? "tag" : seat.tag;
    return {
      core,
      modifiers,
      confidence: "tap",
      label: meta?.label || "Unknown"
    };
  }

  const vpip = num(seat.stats?.vpip);
  const pfr = num(seat.stats?.pfr);
  const foldTo3bet = num(seat.stats?.foldTo3bet);
  const wtsd = num(seat.stats?.wtsd);
  const modifiers = [];
  if (foldTo3bet != null && foldTo3bet >= 70) modifiers.push("overfolder");
  if (foldTo3bet != null && foldTo3bet <= 35) modifiers.push("overcaller");
  if (wtsd != null && wtsd <= 22) modifiers.push("overfolder");
  if (wtsd != null && wtsd >= 36) modifiers.push("overcaller");

  if (vpip == null && pfr == null) {
    return { core: "unknown", modifiers, confidence: "none", label: modifiers.length ? modifierLabel(modifiers) : "Unknown" };
  }

  const gap = vpip != null && pfr != null ? vpip - pfr : null;
  let core = "tag";
  if (vpip != null && vpip >= 48 && (pfr == null || pfr >= 28)) core = "maniac";
  else if (vpip != null && vpip >= 40 && (pfr == null || pfr < 22 || (gap != null && gap >= 16))) core = "fish";
  else if (vpip != null && vpip >= 32 && pfr != null && pfr < 14) core = "lp";
  else if (vpip != null && vpip >= 26 && (pfr == null || pfr >= 20)) core = "lag";
  else if (vpip != null && vpip < 14) core = "nit";
  else core = "tag";

  const coreLabel = ARCHETYPES.find((a) => a.id === core)?.label || "TAG";
  const extra = modifiers.filter((m) => m !== core);
  return {
    core,
    modifiers: extra,
    confidence: "stats",
    label: extra.length ? `${coreLabel} · ${modifierLabel(extra)}` : coreLabel
  };
}

function modifierLabel(modifiers) {
  return modifiers
    .map((id) => ARCHETYPES.find((a) => a.id === id)?.label)
    .filter(Boolean)
    .join(" · ");
}

export function hasRead(seat) {
  const read = classify(seat);
  return read.confidence !== "none" || read.modifiers.length > 0;
}

export function isLoose(read) {
  return ["fish", "lp", "lag", "maniac"].includes(read?.core);
}

export function isPassive(read) {
  return ["fish", "lp", "nit"].includes(read?.core) || read?.modifiers.includes("overcaller");
}
