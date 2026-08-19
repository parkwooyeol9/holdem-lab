const RANKS = "23456789TJQKA";
const SUITS = ["s", "h", "d", "c"];
const SUIT_ICON = { s: "♠", h: "♥", d: "♦", c: "♣" };
const RANK_VALUE = Object.fromEntries([...RANKS].map((r, i) => [r, i + 2]));

export const STARTING_STACK = 1000;
export const SMALL_BLIND = 5;
export const BIG_BLIND = 10;
export const SEAT_COUNT = 9;
export const ACTION_SECONDS = 10;

export function prettyCard(code) {
  if (!code || code === "xx") return "?";
  return `${code[0]}${SUIT_ICON[code[1]]}`;
}

export function isRed(code) {
  return Boolean(code) && (code[1] === "h" || code[1] === "d");
}

export function freshDeck(seed = Date.now()) {
  const cards = RANKS.split("").flatMap((r) => SUITS.map((s) => r + s));
  const rng = mulberry32(seed >>> 0);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function combinations(arr, k) {
  const out = [];
  const walk = (start, chosen) => {
    if (chosen.length === k) {
      out.push(chosen.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      chosen.push(arr[i]);
      walk(i + 1, chosen);
      chosen.pop();
    }
  };
  walk(0, []);
  return out;
}

function score5(cards) {
  const ranks = cards.map((c) => RANK_VALUE[c[0]]).sort((a, b) => b - a);
  const suits = cards.map((c) => c[1]);
  const flush = suits.every((s) => s === suits[0]);
  const counts = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([r, n]) => ({ r: Number(r), n }))
    .sort((a, b) => b.n - a.n || b.r - a.r);

  const uniq = [...new Set(ranks)].sort((a, b) => b - a);
  let straightHigh = 0;
  if (uniq.includes(14) && [5, 4, 3, 2].every((v) => uniq.includes(v))) straightHigh = 5;
  for (let i = 0; i < uniq.length - 4; i++) {
    if (uniq[i] - uniq[i + 4] === 4) straightHigh = Math.max(straightHigh, uniq[i]);
  }

  const pack = (cat, kicker) => cat * 1e8 + kicker;
  const kick = (vals) => vals.reduce((acc, v, i) => acc + v * 15 ** (5 - i), 0);

  if (flush && straightHigh) return [pack(8, kick([straightHigh])), straightHigh === 14 ? "Royal flush" : "Straight flush"];
  if (groups[0].n === 4) return [pack(7, kick([groups[0].r, groups[1].r])), "Four of a kind"];
  if (groups[0].n === 3 && groups[1]?.n === 2) return [pack(6, kick([groups[0].r, groups[1].r])), "Full house"];
  if (flush) return [pack(5, kick(ranks)), "Flush"];
  if (straightHigh) return [pack(4, kick([straightHigh])), "Straight"];
  if (groups[0].n === 3) return [pack(3, kick([groups[0].r, ...groups.slice(1).map((g) => g.r)])), "Three of a kind"];
  if (groups[0].n === 2 && groups[1]?.n === 2) {
    const pairA = Math.max(groups[0].r, groups[1].r);
    const pairB = Math.min(groups[0].r, groups[1].r);
    return [pack(2, kick([pairA, pairB, groups[2].r])), "Two pair"];
  }
  if (groups[0].n === 2) return [pack(1, kick([groups[0].r, ...groups.slice(1).map((g) => g.r)])), "Pair"];
  return [pack(0, kick(ranks)), "High card"];
}

export function evaluateHand(hole, board) {
  const cards = [...hole, ...board];
  let best = [-1, "High card"];
  for (const combo of combinations(cards, 5)) {
    const scored = score5(combo);
    if (scored[0] > best[0]) best = scored;
  }
  return { score: best[0], name: best[1] };
}

export function emptyTable(meta) {
  return {
    id: meta.id,
    name: meta.name,
    vibe: meta.vibe,
    blinds: `${SMALL_BLIND}/${BIG_BLIND}`,
    seats: Array(SEAT_COUNT).fill(null),
    spectators: [],
    chat: [],
    floaters: [],
    button: 0,
    street: "waiting",
    board: [],
    pot: 0,
    toAct: null,
    currentBet: 0,
    minRaise: BIG_BLIND,
    deck: [],
    seed: 0,
    handNo: 0,
    winners: null,
    actionEndsAt: null,
    showdownAt: null,
    hostId: null,
    updatedAt: Date.now()
  };
}

export function playerView(table, playerId) {
  const clone = structuredClone(table);
  const reveal = clone.street === "showdown";
  for (const seat of clone.seats) {
    if (!seat) continue;
    const mine = seat.id === playerId;
    if (!mine && !reveal) seat.hole = seat.hole?.length ? ["xx", "xx"] : [];
  }
  return clone;
}

function nextSeat(table, from, pred) {
  for (let step = 1; step <= SEAT_COUNT; step++) {
    const idx = (from + step) % SEAT_COUNT;
    const p = table.seats[idx];
    if (p && pred(p, idx)) return idx;
  }
  return null;
}

function canAct(p) {
  return p.inHand && !p.folded && !p.allIn;
}

function inPot(p) {
  return p.inHand && !p.folded;
}

function commit(player, amount) {
  const pay = Math.min(player.stack, Math.max(0, amount));
  player.stack -= pay;
  player.bet += pay;
  player.invested += pay;
  if (player.stack === 0) player.allIn = true;
  return pay;
}

function potTotal(table) {
  table.pot = table.seats.reduce((sum, p) => sum + (p?.invested || 0), 0);
}

function pushChat(table, from, text, hue, extra = {}) {
  table.chat = [...table.chat, { id: `${Date.now()}-${Math.random()}`, from, text, hue, face: extra.face, emoji: extra.emoji, at: Date.now() }].slice(-80);
}

export function sitDown(table, player, seatIndex) {
  if (seatIndex < 0 || seatIndex >= SEAT_COUNT) return { error: "Invalid seat." };
  if (table.seats[seatIndex]) return { error: "That seat is taken." };
  if (table.seats.some((s) => s?.id === player.id)) return { error: "You already have a seat." };
  table.seats[seatIndex] = {
    id: player.id,
    nick: player.nick,
    hue: player.hue,
    face: player.face || "😎",
    stack: STARTING_STACK,
    bet: 0,
    invested: 0,
    hole: [],
    folded: true,
    allIn: false,
    inHand: false,
    acted: false,
    lastAction: "sits",
    bot: Boolean(player.bot)
  };
  table.spectators = table.spectators.filter((s) => s.id !== player.id);
  pushChat(table, "system", `${player.nick} sits down`);
  maybeStartHand(table);
  table.updatedAt = Date.now();
  return { ok: true };
}

export function standUp(table, playerId) {
  const idx = table.seats.findIndex((s) => s?.id === playerId);
  if (idx < 0) {
    table.spectators = table.spectators.filter((s) => s.id !== playerId);
    table.updatedAt = Date.now();
    return { ok: true };
  }
  const p = table.seats[idx];
  if (p.inHand && !p.folded) {
    p.folded = true;
    p.acted = true;
    p.lastAction = "leaves";
  }
  pushChat(table, "system", `${p.nick} leaves the table`);
  table.seats[idx] = null;
  if (table.street !== "waiting" && table.street !== "showdown") {
    const alive = table.seats.filter((s) => s && inPot(s));
    if (alive.length <= 1) finishHand(table);
    else if (table.toAct === idx) continueBetting(table);
  }
  table.updatedAt = Date.now();
  return { ok: true };
}

export function watchTable(table, player) {
  if (table.seats.some((s) => s?.id === player.id)) return;
  if (!table.spectators.some((s) => s.id === player.id)) {
    table.spectators.push({ id: player.id, nick: player.nick, hue: player.hue, face: player.face });
    table.updatedAt = Date.now();
  }
}

export function chat(table, player, text) {
  const clean = String(text || "").trim().slice(0, 140);
  if (!clean) return;
  const emojiOnly = /^[\p{Extended_Pictographic}\uFE0F\u200D]{1,8}$/u.test(clean);
  pushChat(table, player.nick, clean, player.hue, { face: player.face, emoji: emojiOnly });
  if (emojiOnly) {
    table.floaters = [...(table.floaters || []), { id: `${Date.now()}-${player.id}`, playerId: player.id, emoji: clean, at: Date.now() }].slice(-16);
  }
  table.updatedAt = Date.now();
}

export function maybeStartHand(table) {
  if (table.street !== "waiting") return;
  const ready = table.seats.map((p, i) => (p && p.stack >= BIG_BLIND ? i : null)).filter((i) => i !== null);
  if (ready.length >= 2) dealHand(table, ready);
}

export function nextHand(table) {
  for (const p of table.seats) {
    if (!p) continue;
    p.hole = [];
    p.bet = 0;
    p.invested = 0;
    p.folded = true;
    p.allIn = false;
    p.inHand = false;
    p.acted = false;
    p.lastAction = "";
    p.handName = null;
    if (p.stack <= 0) p.stack = STARTING_STACK;
  }
  table.street = "waiting";
  table.winners = null;
  table.board = [];
  table.toAct = null;
  table.actionEndsAt = null;
  table.showdownAt = null;
  maybeStartHand(table);
  table.updatedAt = Date.now();
}

function dealHand(table, readyIdx) {
  const currentPos = readyIdx.includes(table.button) ? readyIdx.indexOf(table.button) : -1;
  table.button = readyIdx[(currentPos + 1) % readyIdx.length];

  table.seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  table.deck = freshDeck(table.seed);
  table.board = [];
  table.winners = null;
  table.handNo += 1;
  table.street = "preflop";
  table.currentBet = BIG_BLIND;
  table.minRaise = BIG_BLIND;

  for (const p of table.seats) {
    if (!p) continue;
    p.bet = 0;
    p.invested = 0;
    p.hole = [];
    p.folded = true;
    p.allIn = false;
    p.inHand = false;
    p.acted = false;
    p.lastAction = "";
    p.handName = null;
  }

  for (const i of readyIdx) {
    const p = table.seats[i];
    p.inHand = true;
    p.folded = false;
    p.hole = [table.deck.pop(), table.deck.pop()];
  }

  const headsUp = readyIdx.length === 2;
  const sb = headsUp ? table.button : nextSeat(table, table.button, (p) => p.inHand);
  const bb = nextSeat(table, sb, (p) => p.inHand);

  commit(table.seats[sb], SMALL_BLIND);
  table.seats[sb].lastAction = "small blind";
  commit(table.seats[bb], BIG_BLIND);
  table.seats[bb].lastAction = "big blind";
  table.seats[bb].acted = false;

  table.toAct = nextSeat(table, bb, (p) => canAct(p));
  potTotal(table);
  table.actionEndsAt = Date.now() + ACTION_SECONDS * 1000;
  pushChat(table, "system", `Hand #${table.handNo} · ${table.seats[table.button]?.nick} has the button`);
}

export function act(table, playerId, type, raiseTo) {
  if (table.street === "waiting" || table.street === "showdown") return { error: "No hand in progress." };
  const idx = table.seats.findIndex((s) => s?.id === playerId);
  if (idx !== table.toAct) return { error: "It's not your turn." };
  const p = table.seats[idx];
  if (!p || !canAct(p)) return { error: "You can't act." };

  const toCall = Math.max(0, table.currentBet - p.bet);

  if (type === "fold") {
    p.folded = true;
    p.lastAction = "fold";
  } else if (type === "check") {
    if (toCall > 0) return { error: "You need to call or fold." };
    p.lastAction = "check";
  } else if (type === "call") {
    if (toCall === 0) p.lastAction = "check";
    else {
      commit(p, toCall);
      p.lastAction = p.allIn ? "all-in" : "call";
    }
  } else if (type === "raise") {
    const target = Math.min(p.stack + p.bet, Math.max(Number(raiseTo) || 0, table.currentBet + table.minRaise));
    if (target <= p.bet) return { error: "Raise is too small." };
    const raiseSize = target - table.currentBet;
    commit(p, target - p.bet);
    if (p.bet > table.currentBet) {
      if (raiseSize >= table.minRaise) table.minRaise = raiseSize;
      table.currentBet = p.bet;
      for (const s of table.seats) {
        if (s && s.id !== p.id && canAct(s)) s.acted = false;
      }
    }
    p.lastAction = p.allIn ? "all-in" : `raise to ${p.bet}`;
  } else {
    return { error: "Unknown action." };
  }

  p.acted = true;
  potTotal(table);
  continueBetting(table);
  table.updatedAt = Date.now();
  return { ok: true };
}

export function autoAct(table) {
  if (table.toAct == null) return;
  if (table.street === "waiting" || table.street === "showdown") return;
  if (table.actionEndsAt && Date.now() < table.actionEndsAt) return;
  const p = table.seats[table.toAct];
  if (!p) return;
  if (p.bot) {
    playBot(table, p);
    return;
  }
  const toCall = Math.max(0, table.currentBet - p.bet);
  act(table, p.id, toCall > 0 ? "fold" : "check");
}

const BOT_NAMES = ["Checky", "RiverBot", "BluffCat", "TightTom", "LuckyLin", "NitNora", "SplashSam", "Foldy"];
const BOT_FACES = ["🤖", "🐸", "🐯", "🦉", "🐲", "🐼", "🐺", "👽"];

export function addBot(table, seatIndex) {
  const empty = seatIndex == null ? table.seats.findIndex((s) => !s) : seatIndex;
  if (empty < 0 || empty >= SEAT_COUNT) return { error: "No open seat." };
  if (table.seats[empty]) return { error: "That seat is taken." };
  const used = new Set(table.seats.filter(Boolean).map((s) => s.nick));
  const usedFaces = new Set(table.seats.filter(Boolean).map((s) => s.face));
  const nick = BOT_NAMES.find((n) => !used.has(n)) || `Bot ${empty + 1}`;
  const face = BOT_FACES.find((f) => !usedFaces.has(f)) || "🤖";
  let hue = 0;
  for (const ch of nick) hue = (hue * 31 + ch.charCodeAt(0)) % 360;
  return sitDown(table, { id: `bot-${empty}-${Date.now()}`, nick, hue, face, bot: true }, empty);
}

export function removeBot(table, seatIndex) {
  const idx =
    seatIndex != null && table.seats[seatIndex]?.bot
      ? seatIndex
      : [...table.seats.keys()].reverse().find((i) => table.seats[i]?.bot);
  if (idx == null || idx < 0) return { error: "No bots seated." };
  return standUp(table, table.seats[idx].id);
}

function holeStrength(hole) {
  if (!hole?.[0] || hole[0] === "xx") return 30;
  const r1 = RANK_VALUE[hole[0][0]];
  const r2 = RANK_VALUE[hole[1][0]];
  const high = Math.max(r1, r2);
  const low = Math.min(r1, r2);
  const pair = r1 === r2;
  const suited = hole[0][1] === hole[1][1];
  let s = high * 2.2 + low * 0.8;
  if (pair) s += 28 + high;
  if (suited) s += 8;
  if (high - low <= 2) s += 7;
  if (high >= 12 && low >= 10) s += 12;
  return s;
}

export function playBot(table, p) {
  const legal = legalActions(table, p.id);
  if (!legal.can) return { error: "Bot cannot act." };
  let strength = holeStrength(p.hole);
  if (table.board.length >= 3 && p.hole?.[0] !== "xx") {
    const cat = Math.floor(evaluateHand(p.hole, table.board).score / 1e8);
    strength = 22 + cat * 14 + (cat >= 1 ? 12 : 0);
  }
  const roll = Math.random();
  if (legal.canCheck) {
    if (strength > 58 && legal.canRaise && roll < 0.4) {
      const size = Math.min(legal.maxRaise, Math.max(legal.minRaise, Math.round(Math.max(table.pot, BIG_BLIND * 2) * 0.66)));
      return act(table, p.id, "raise", size);
    }
    return act(table, p.id, "check");
  }
  if (legal.toCall >= p.stack * 0.45 && strength < 52) return act(table, p.id, "fold");
  if (strength < 30 && legal.toCall > BIG_BLIND * 2) return act(table, p.id, "fold");
  if (strength > 72 && legal.canRaise && roll < 0.45) {
    return act(table, p.id, "raise", Math.min(legal.maxRaise, legal.minRaise));
  }
  return act(table, p.id, "call");
}

function continueBetting(table) {
  const alive = table.seats.map((p, i) => (p && inPot(p) ? i : null)).filter((i) => i !== null);
  if (alive.length <= 1) {
    finishHand(table);
    return;
  }

  const actors = table.seats.map((p, i) => (p && canAct(p) ? i : null)).filter((i) => i !== null);
  const matched = table.seats.every((p) => !p || !inPot(p) || p.allIn || p.bet === table.currentBet);
  const allActed = actors.every((i) => table.seats[i].acted);

  if (actors.length === 0 || (matched && allActed && actors.length <= 1) || (matched && allActed)) {
    if (table.street === "river" || actors.length <= 1) {
      if (table.street !== "river" && alive.length > 1) while (table.board.length < 5) table.board.push(table.deck.pop());
      finishHand(table);
    } else {
      dealNextStreet(table);
    }
    return;
  }

  table.toAct = nextSeat(table, table.toAct, (p) => canAct(p) && !p.acted);
  if (table.toAct == null) table.toAct = nextSeat(table, table.toAct ?? 0, (p) => canAct(p));
  table.actionEndsAt = Date.now() + ACTION_SECONDS * 1000;
}

function dealNextStreet(table) {
  for (const p of table.seats) {
    if (!p) continue;
    p.bet = 0;
    p.acted = false;
    if (p.lastAction !== "fold") p.lastAction = p.allIn ? "all-in" : "";
  }
  table.currentBet = 0;
  table.minRaise = BIG_BLIND;
  potTotal(table);

  if (table.street === "preflop") {
    table.board.push(table.deck.pop(), table.deck.pop(), table.deck.pop());
    table.street = "flop";
  } else if (table.street === "flop") {
    table.board.push(table.deck.pop());
    table.street = "turn";
  } else {
    table.board.push(table.deck.pop());
    table.street = "river";
  }

  const actors = table.seats.map((p, i) => (p && canAct(p) ? i : null)).filter((i) => i !== null);
  if (actors.length <= 1) {
    while (table.board.length < 5) table.board.push(table.deck.pop());
    finishHand(table);
    return;
  }

  table.toAct = nextSeat(table, table.button, (p) => canAct(p));
  table.actionEndsAt = Date.now() + ACTION_SECONDS * 1000;
}

function finishHand(table) {
  const alive = table.seats.map((p, i) => (p && inPot(p) ? i : null)).filter((i) => i !== null);
  if (alive.length > 1 && table.board.length < 5) {
    while (table.board.length < 5) table.board.push(table.deck.pop());
  }

  const pots = buildPots(table.seats);
  const winners = [];

  if (alive.length === 1) {
    const w = table.seats[alive[0]];
    const total = pots.reduce((s, pot) => s + pot.amount, 0) || table.seats.reduce((s, p) => s + (p?.invested || 0), 0);
    w.stack += total;
    winners.push({ nick: w.nick, amount: total, name: "uncontested", ids: [w.id] });
  } else {
    for (const pot of pots) {
      let best = -1;
      let tied = [];
      for (const i of pot.eligible) {
        const p = table.seats[i];
        if (!p?.hole?.length) continue;
        const ev = evaluateHand(p.hole, table.board);
        p.handName = ev.name;
        if (ev.score > best) {
          best = ev.score;
          tied = [{ i, ev }];
        } else if (ev.score === best) tied.push({ i, ev });
      }
      if (!tied.length) continue;
      const share = Math.floor(pot.amount / tied.length);
      const rem = pot.amount - share * tied.length;
      tied.forEach((t, n) => {
        table.seats[t.i].stack += share + (n === 0 ? rem : 0);
      });
      winners.push({
        nick: tied.map((t) => table.seats[t.i].nick).join(" & "),
        amount: pot.amount,
        name: tied[0].ev.name,
        ids: tied.map((t) => table.seats[t.i].id)
      });
    }
  }

  table.pot = 0;
  table.toAct = null;
  table.actionEndsAt = null;
  table.street = "showdown";
  table.winners = winners;
  table.showdownAt = Date.now();
  pushChat(table, "system", winners.map((w) => `${w.nick} wins ${w.amount}${w.name === "uncontested" ? "" : ` with ${w.name}`}`).join(" · "));
  table.updatedAt = Date.now();
}

function buildPots(seats) {
  const levels = [...new Set(seats.map((p) => p?.invested || 0).filter((n) => n > 0))].sort((a, b) => a - b);
  const pots = [];
  let prev = 0;
  for (const level of levels) {
    const amount = seats.reduce((sum, p) => sum + (p ? Math.max(0, Math.min(p.invested, level) - prev) : 0), 0);
    const eligible = seats.map((p, i) => (p && !p.folded && p.invested >= level ? i : null)).filter((i) => i !== null);
    if (amount > 0) pots.push({ amount, eligible: eligible.length ? eligible : seats.map((p, i) => (p && !p.folded ? i : null)).filter((i) => i !== null) });
    prev = level;
  }
  return pots;
}

export function legalActions(table, playerId) {
  const idx = table.seats.findIndex((s) => s?.id === playerId);
  if (idx !== table.toAct || table.street === "waiting" || table.street === "showdown") {
    return { can: false, toCall: 0, minRaise: 0, maxRaise: 0, canCheck: false, canRaise: false };
  }
  const p = table.seats[idx];
  const toCall = Math.max(0, table.currentBet - p.bet);
  return {
    can: true,
    toCall,
    minRaise: Math.min(p.stack + p.bet, table.currentBet + table.minRaise),
    maxRaise: p.stack + p.bet,
    canCheck: toCall === 0,
    canRaise: p.stack > toCall
  };
}
