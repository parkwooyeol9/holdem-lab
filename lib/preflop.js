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

export function recommend({ hole, heroPos, actions, seats }) {
  const hand = holeLabel(hole);
  if (!hand) {
    return { action: "—", detail: "Need hole cards", reason: "Tap your two cards, then mark the action in front of you." };
  }

  const spot = parseSpot(actions, heroPos);
  if (spot.incomplete) {
    return {
      action: "—",
      detail: `${hand} · ${heroPos}`,
      reason: "Mark fold / limp / open / call / 3-bet for every seat in front of you."
    };
  }

  if (spot.level <= 1) return rfiOrIsolate(hand, heroPos, spot, seats);
  if (spot.level === 2) return vsOpen(hand, heroPos, spot, seats);
  if (spot.level === 3) return vsThreeBet(hand, heroPos, spot, seats);
  return vsFourBet(hand, heroPos, spot, seats);
}

function rfiOrIsolate(hand, heroPos, spot, seats) {
  if (!spot.limpers.length) {
    if (heroPos === "BB") {
      return { action: "Check", detail: `${hand} · BB`, reason: "Folded to you in the big blind — take the free check." };
    }
    if (inRange(hand, RFI[heroPos])) {
      return { action: "Open", detail: `${hand} · ${heroPos}`, reason: `${hand} is in a standard 6-max ${heroPos} opening range.` };
    }
    return { action: "Fold", detail: `${hand} · ${heroPos}`, reason: `${hand} is below a standard ${heroPos} open. Wait for a better spot.` };
  }

  const limpRead = villainOf(seats, spot.limpers[0]);
  const isolate = merge(ISOLATE_LIMP, isLoose(limpRead) ? "A7o+,KJo+,QTo+,JTo" : "");
  if (heroPos === "BB" && !inRange(hand, isolate)) {
    return { action: "Check", detail: `${hand} · BB`, reason: `Limped pot. ${hand} can see a flop for free; raising needs a stronger isolating hand.` };
  }
  if (inRange(hand, isolate)) {
    return {
      action: "Raise",
      detail: `${hand} · ${heroPos}`,
      reason: `Isolate the limp${spot.limpers.length > 1 ? "s" : ""} (${spot.limpers.join(", ")}). ${vsLine(limpRead, spot.limpers[0])}.`
    };
  }
  return { action: "Fold", detail: `${hand} · ${heroPos}`, reason: `${hand} is not strong enough to isolate. Let the limper keep the dead money.` };
}

function vsOpen(hand, heroPos, spot, seats) {
  const opener = spot.opener;
  const read = villainOf(seats, opener);
  const ip = POS_6.indexOf(heroPos) > POS_6.indexOf(opener) && heroPos !== "BB" && heroPos !== "SB";
  const value = VALUE_3BET[opener] || VALUE_3BET.UTG;
  const steal = opener === "BTN" || opener === "CO" || opener === "SB";
  const lightOk = read.modifiers.includes("overfolder") || read.core === "nit" || (steal && read.core !== "fish" && read.core !== "lp" && !read.modifiers.includes("overcaller"));
  const noBluff = read.core === "fish" || read.core === "lp" || read.modifiers.includes("overcaller") || read.core === "maniac";

  if (inRange(hand, value)) {
    return {
      action: "3-bet",
      detail: `${hand} · ${heroPos}`,
      reason: `Value 3-bet ${vsLine(read, opener)}. ${hand} is ahead of a typical ${opener} opening range.`
    };
  }

  if (lightOk && !noBluff && inRange(hand, LIGHT_3BET[heroPos])) {
    return {
      action: "3-bet",
      detail: `${hand} · ${heroPos}`,
      reason: `Light 3-bet ${vsLine(read, opener)}. They fold too much or opened too wide — apply pressure.`
    };
  }

  if (read.core === "nit" && !inRange(hand, "QQ+,AKs,AKo")) {
    return {
      action: "Fold",
      detail: `${hand} · ${heroPos}`,
      reason: `A Nit ${opener} open is strong. ${hand} does not defend profitably; wait.`
    };
  }

  const callRange = CALL_OPEN[heroPos] || CALL_OPEN.BB;
  const callWider = noBluff || isPassive(read) || (ip && isLoose(read));
  const extraCall = callWider ? "22+,A9s+,KJs,QJs,JTs,T9s,98s" : "";
  if (spot.callers.length && !inRange(hand, "22-JJ,AQs+,KQs,QJs,JTs,T9s,98s,87s")) {
    return {
      action: "Fold",
      detail: `${hand} · ${heroPos}`,
      reason: `Multiway after ${opener} open. Keep ${hand} out unless it flops well.`
    };
  }
  if (inRange(hand, merge(callRange, extraCall))) {
    const why = noBluff
      ? `Call and value later. ${vsLine(read, opener)} does not fold, so skip the bluff 3-bet.`
      : `Call ${vsLine(read, opener)}. ${ip ? "In position, " : ""}${hand} realizes well enough as a call.`;
    return { action: "Call", detail: `${hand} · ${heroPos}`, reason: why };
  }

  return {
    action: "Fold",
    detail: `${hand} · ${heroPos}`,
    reason: `${hand} is not a call or 3-bet ${vsLine(read, opener)}.`
  };
}

function vsThreeBet(hand, heroPos, spot, seats) {
  const aggro = villainOf(seats, spot.threeBettor);
  const vs = vsLine(aggro, spot.threeBettor);
  if (inRange(hand, FOUR_BET) || (aggro.core === "lag" && inRange(hand, "QQ+,AKs,AKo")) || (aggro.core === "maniac" && inRange(hand, "JJ+,AQs+,AKo"))) {
    return { action: "4-bet", detail: `${hand} · ${heroPos}`, reason: `4-bet for value ${vs}. ${hand} still dominates their 3-bet range.` };
  }
  if (aggro.modifiers.includes("overcaller") || aggro.core === "fish" || aggro.core === "lp") {
    if (inRange(hand, "JJ+,AQs+,AKo")) {
      return { action: "Call", detail: `${hand} · ${heroPos}`, reason: `Flat ${vs}. They 3-bet/call too wide — get it in later.` };
    }
    return { action: "Fold", detail: `${hand} · ${heroPos}`, reason: `${vs} continues too often. ${hand} is not a value continue.` };
  }
  if (aggro.core === "nit") {
    return { action: "Fold", detail: `${hand} · ${heroPos}`, reason: `A Nit 3-bet is a premium. Fold ${hand} unless it is KK+ / AK.` };
  }
  if (inRange(hand, CALL_3BET) || (aggro.modifiers.includes("overfolder") && inRange(hand, "JJ+,AQs+,AKo"))) {
    return { action: "Call", detail: `${hand} · ${heroPos}`, reason: `Continue ${vs}. ${hand} can play a 3-bet pot.` };
  }
  return { action: "Fold", detail: `${hand} · ${heroPos}`, reason: `Fold ${hand} to the 3-bet ${vs}.` };
}

function vsFourBet(hand, heroPos, spot, seats) {
  const vs = vsLine(villainOf(seats, spot.threeBettor), spot.threeBettor);
  if (inRange(hand, "KK+,AKs")) {
    return { action: "All-in", detail: `${hand} · ${heroPos}`, reason: `${hand} stacks off against a 4-bet ${vs}.` };
  }
  return { action: "Fold", detail: `${hand} · ${heroPos}`, reason: `4-bet pots are premium-only. Fold ${hand} ${vs}.` };
}
