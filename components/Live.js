"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import Card from "./Card";
import { RANK_ORDER, SUIT_LIST, compactCards, holeLabel } from "@/lib/indicators";
import { ARCHETYPES, POS_6, STAT_FIELDS, classify, emptyTable, hasRead } from "@/lib/villains";
import { legalActions, recommend } from "@/lib/preflop";

const SEATS_KEY = "hl-live-seats";
const HAND_KEY = "hl-live-hand";

const ACTION_LABEL = {
  fold: "Fold",
  limp: "Limp",
  open: "Open",
  call: "Call",
  "3bet": "3-bet",
  "4bet": "4-bet",
  check: "Check"
};

function emptyHand(heroPos = "BTN") {
  return {
    heroPos,
    hole: [null, null],
    actions: Object.fromEntries(POS_6.map((pos) => [pos, ""]))
  };
}

function loadSeats() {
  const base = emptyTable();
  try {
    const parsed = JSON.parse(localStorage.getItem(SEATS_KEY) || "null");
    if (!parsed) return base;
    for (const pos of POS_6) {
      base[pos] = {
        ...base[pos],
        ...parsed[pos],
        pos,
        stats: { ...base[pos].stats, ...parsed[pos]?.stats }
      };
    }
    return base;
  } catch {
    return base;
  }
}

function loadHand() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(HAND_KEY) || "null");
    if (!parsed) return emptyHand();
    return { ...emptyHand(parsed.heroPos || "BTN"), ...parsed, hole: [parsed.hole?.[0] || null, parsed.hole?.[1] || null] };
  } catch {
    return emptyHand();
  }
}

function Slot({ card, label, onClick, onClear }) {
  return (
    <div className={"live-slot-wrap" + (card ? " filled" : "")}>
      <button type="button" className={"live-slot" + (card ? "" : " empty")} onClick={onClick} aria-label={label}>
        {card ? <Card c={card} /> : <span>+</span>}
      </button>
      <small>{label}</small>
      {card ? (
        <button type="button" className="live-slot-clear" onClick={onClear} aria-label={`Clear ${label}`}>
          <X />
        </button>
      ) : null}
    </div>
  );
}

export default function Live() {
  const [seats, setSeats] = useState(emptyTable);
  const [hand, setHand] = useState(emptyHand);
  const [picker, setPicker] = useState(null);
  const [editPos, setEditPos] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSeats(loadSeats());
    setHand(loadHand());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SEATS_KEY, JSON.stringify(seats));
    } catch {}
  }, [seats, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(HAND_KEY, JSON.stringify(hand));
    } catch {}
  }, [hand, hydrated]);

  const used = useMemo(() => new Set(compactCards(hand.hole)), [hand.hole]);
  const rec = useMemo(
    () => recommend({ hole: hand.hole, heroPos: hand.heroPos, actions: hand.actions, seats }),
    [hand, seats]
  );
  const heroIdx = POS_6.indexOf(hand.heroPos);
  const visualOrder = POS_6.map((_, i) => POS_6[(heroIdx + i) % POS_6.length]);
  const ahead = POS_6.slice(0, heroIdx);
  const editSeat = editPos ? seats[editPos] : null;
  const pickCode = picker != null ? hand.hole[picker] : null;

  const setHero = (pos) => {
    setHand((h) => ({
      ...emptyHand(pos),
      hole: h.hole
    }));
  };

  const setCard = (index, code) => {
    setHand((h) => {
      const hole = [...h.hole];
      hole[index] = code;
      return { ...h, hole };
    });
    setPicker(null);
  };

  const setAction = (pos, action) => {
    setHand((h) => {
      const actions = { ...h.actions, [pos]: h.actions[pos] === action ? "" : action };
      const idx = POS_6.indexOf(pos);
      for (const later of POS_6.slice(idx + 1)) {
        if (!actions[later]) continue;
        if (!legalActions(actions, later).includes(actions[later])) actions[later] = "";
      }
      return { ...h, actions };
    });
  };

  const patchSeat = (pos, patch) => {
    setSeats((s) => ({ ...s, [pos]: { ...s[pos], ...patch, stats: { ...s[pos].stats, ...(patch.stats || {}) } } }));
  };

  const nextHand = () => {
    setPicker(null);
    setHand((h) => emptyHand(h.heroPos));
  };

  return (
    <div className="page live-page">
      <div className="live-top">
        <div>
          <span className="tag">LIVE · 6-MAX</span>
          <h1>Tag the table. Get a line.</h1>
          <p>Save a read on each seat. When a hand starts, enter your cards and the action in front of you.</p>
        </div>
        <button className="ghost" type="button" onClick={nextHand}>
          <RotateCcw /> Next hand
        </button>
      </div>

      <section className="live-felt-card">
        <small>YOU ARE</small>
        <div className="live-chips">
          {POS_6.map((pos) => (
            <button key={pos} type="button" className={hand.heroPos === pos ? "on" : ""} onClick={() => setHero(pos)}>
              {pos}
            </button>
          ))}
        </div>
        <div className="live-felt">
          {visualOrder.map((pos, visual) => {
            const read = classify(seats[pos]);
            const isHero = pos === hand.heroPos;
            const acted = hand.actions[pos];
            return (
              <button
                key={pos}
                type="button"
                className={`live-seat live-seat-${visual}${isHero ? " hero" : ""}${hasRead(seats[pos]) ? " tagged" : ""}`}
                onClick={() => {
                  if (!isHero) setEditPos(pos);
                }}
              >
                <b>
                  {pos}
                  {isHero ? " · YOU" : ""}
                </b>
                <span>{isHero ? holeLabel(hand.hole) || "Your cards" : read.label}</span>
                {acted ? <em>{ACTION_LABEL[acted]}</em> : null}
              </button>
            );
          })}
          <div className="live-felt-core">6-max</div>
        </div>
        <p className="live-felt-hint">Tap an opponent to enter VPIP / PFR / 3-bet, or just stamp a type.</p>
      </section>

      <section className="live-cards">
        <div>
          <small>YOUR HAND</small>
          <div className="live-slots">
            {hand.hole.map((c, i) => (
              <Slot
                key={`h${i}`}
                card={c}
                label={i === 0 ? "Card 1" : "Card 2"}
                onClick={() => setPicker(i)}
                onClear={() => setCard(i, null)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="live-actions">
        <small>ACTION IN FRONT</small>
        {ahead.length === 0 ? (
          <p>You are UTG. No action in front — this is an open-or-fold.</p>
        ) : (
          ahead.map((pos) => {
            const options = legalActions(hand.actions, pos);
            return (
              <div className="live-action-row" key={pos}>
                <b>{pos}</b>
                <div className="live-chips compact">
                  {options.map((act) => (
                    <button
                      key={act}
                      type="button"
                      className={hand.actions[pos] === act ? "on" : ""}
                      onClick={() => setAction(pos, act)}
                    >
                      {ACTION_LABEL[act]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className={"live-rec" + (rec.action === "Fold" ? " fold" : rec.action === "—" ? "" : " go")}>
        <small>RECOMMENDATION</small>
        <h2>{rec.action}</h2>
        <b>{rec.detail}</b>
        <p>{rec.reason}</p>
      </section>

      {editPos && editSeat && (
        <div className="live-picker-scrim" onClick={() => setEditPos(null)}>
          <div className="live-editor" onClick={(e) => e.stopPropagation()}>
            <div className="live-picker-head">
              <b>{editPos} read</b>
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  patchSeat(editPos, { tag: null, stats: { vpip: "", pfr: "", threeBet: "", foldTo3bet: "", wtsd: "" } });
                }}
              >
                Clear
              </button>
            </div>
            <p className="live-editor-lead">Stamp a type, or type frequencies if you have them. Both feed the same line.</p>
            <div className="live-chips">
              {ARCHETYPES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={editSeat.tag === a.id ? "on" : ""}
                  onClick={() => patchSeat(editPos, { tag: editSeat.tag === a.id ? null : a.id })}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <div className="live-stat-grid">
              {STAT_FIELDS.map((f) => (
                <label key={f.key}>
                  <small>{f.label}</small>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    inputMode="decimal"
                    placeholder="%"
                    value={editSeat.stats[f.key]}
                    onChange={(e) => patchSeat(editPos, { tag: null, stats: { [f.key]: e.target.value } })}
                  />
                </label>
              ))}
            </div>
            <button className="cta" type="button" onClick={() => setEditPos(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {picker != null && (
        <div className="live-picker-scrim" onClick={() => setPicker(null)}>
          <div className="live-picker" onClick={(e) => e.stopPropagation()}>
            <div className="live-picker-head">
              <b>Pick a card</b>
              <button type="button" className="ghost" onClick={() => setCard(picker, null)}>
                Clear
              </button>
            </div>
            <div className="live-grid">
              {SUIT_LIST.map((suit) => (
                <div key={suit.value} className="live-grid-row">
                  {[...RANK_ORDER].map((rank) => {
                    const code = rank + suit.value;
                    const taken = used.has(code) && pickCode !== code;
                    const selected = pickCode === code;
                    const red = suit.value === "h" || suit.value === "d";
                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={taken}
                        className={"live-grid-card" + (red ? " red" : "") + (selected ? " on" : "")}
                        onClick={() => setCard(picker, code)}
                      >
                        <b>{rank}</b>
                        <span>{suit.icon}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
