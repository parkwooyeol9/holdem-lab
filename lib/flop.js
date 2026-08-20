import { evaluateHand } from "./poker";
import { boardTexture, compactCards, countOuts, holeLabel } from "./indicators";
import { POS_6, POSTFLOP_ORDER, classify } from "./villains";
import { bump, emptyRec, pack } from "./preflop";

export const FLOP_ACTION_LABEL = {
  check: "Check",
  bet: "Bet",
  fold: "Fold",
  call: "Call",
  raise: "Raise"
};

export function alivePositions(preActions, heroPos) {
  return POSTFLOP_ORDER.filter((pos) => pos === heroPos || preActions?.[pos] !== "fold");
}

export function flopStreet(preActions, heroPos) {
  return POS_6.map((pos) => {
    const folded = pos !== heroPos && preActions?.[pos] === "fold";
    return { pos, folded, you: pos === heroPos };
  });
}

export function flopAhead(heroPos, preActions) {
  const alive = alivePositions(preActions, heroPos);
  const idx = alive.indexOf(heroPos);
  return alive.slice(0, Math.max(0, idx));
}

export function legalFlopActions(flopActions, pos, alive) {
  const idx = Math.max(0, alive.indexOf(pos));
  const before = alive.slice(0, idx).map((p) => flopActions?.[p] || "check");
  const faced = before.some((a) => a === "bet" || a === "raise");
  return faced ? ["fold", "call", "raise"] : ["check", "bet"];
}

export function parseFlopSpot(flopActions, ahead) {
  let aggressor = null;
  let level = 0;
  for (const pos of ahead) {
    const act = flopActions?.[pos] || "check";
    if (act === "bet") {
      aggressor = pos;
      level = 1;
    } else if (act === "raise") {
      aggressor = pos;
      level = 2;
    }
  }
  return { incomplete: false, aggressor, level };
}

function category(score) {
  if (score < 0) return 0;
  return Math.floor(score / 1e8);
}

function applyHud(raw, read, faced) {
  const s = read?.stats || {};
  if (read?.modifiers?.includes("overfolder") || (s.foldToCbet != null && s.foldToCbet >= 65)) {
    if (faced) bump(raw, "Raise", 10);
    else bump(raw, "Bet", 12);
    bump(raw, "Fold", -8);
  }
  if (read?.modifiers?.includes("overcaller") || read?.core === "fish" || read?.core === "lp") {
    bump(raw, "Bet", faced ? 0 : -12);
    bump(raw, "Raise", -12);
    bump(raw, "Call", 14);
    bump(raw, "Check", 8);
  }
  if (s.cbet != null && s.cbet >= 80 && faced) bump(raw, "Fold", 8);
  if (s.checkRaise != null && s.checkRaise >= 14 && !faced) bump(raw, "Bet", -8);
  return raw;
}

export function recommendFlop({ hole, flop, heroPos, actions, flopActions, seats }) {
  const hand = holeLabel(hole);
  const board = compactCards(flop).slice(0, 3);
  if (!hand) return emptyRec("Need hole cards", "홀카드 두 장을 테이블 위에서 고르세요.");
  if (board.length < 3) return emptyRec(`${hand} · flop`, "테이블 중앙에 플랍 3장을 깔면 바로 추천이 나옵니다.");

  const ahead = flopAhead(heroPos, actions);
  const spot = parseFlopSpot(flopActions, ahead);

  const ev = evaluateHand(hole, board);
  const cat = category(ev.score);
  const outs = countOuts(hole, board);
  const texture = boardTexture(board);
  const draw = outs?.count >= 8;
  const gutshot = outs?.count >= 4 && outs?.count < 8;
  const ip = heroPos === "BTN" || heroPos === "CO";
  const faced = spot.level > 0;
  const villain = classify(seats?.[spot.aggressor] || seats?.[ahead[ahead.length - 1]]);
  const made = ev.score < 0 ? hand : ev.name;
  const drawTag = outs?.labels?.length ? ` · ${outs.labels.join(" · ")}` : "";
  const textureTag = texture.label ? ` · ${texture.label}` : "";

  let raw;
  if (faced) {
    if (cat >= 2) raw = { Raise: 72, Call: 22, Fold: 6 };
    else if (cat === 1) raw = draw ? { Call: 48, Raise: 28, Fold: 24 } : { Call: 58, Raise: 18, Fold: 24 };
    else if (draw) raw = { Call: 42, Raise: 32, Fold: 26 };
    else if (gutshot) raw = { Fold: 62, Call: 28, Raise: 10 };
    else raw = { Fold: 78, Call: 14, Raise: 8 };
  } else {
    if (cat >= 2) raw = { Bet: 88, Check: 12 };
    else if (cat === 1) raw = ip ? { Bet: 72, Check: 28 } : { Bet: 58, Check: 42 };
    else if (draw) raw = ip ? { Bet: 64, Check: 36 } : { Bet: 48, Check: 52 };
    else if (texture.wetDry === "dry" && ip) raw = { Check: 58, Bet: 42 };
    else raw = { Check: 72, Bet: 28 };
  }

  applyHud(raw, villain, faced);
  const vs = villain?.confidence === "stats" ? ` ${villain.exploit}` : "";
  const line = faced
    ? `${made}${drawTag}${textureTag}. ${spot.aggressor} 벳에 대한 플랍 믹스.${vs}`
    : `${made}${drawTag}${textureTag}. 체크된 플랍 — ${ip ? "인포지션" : "아웃오브포지션"} 믹스.${vs}`;
  return pack(`${made}${drawTag}`, heroPos, line, raw);
}
