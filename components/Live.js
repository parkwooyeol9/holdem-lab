"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import Card from "./Card";
import { RANK_ORDER, SUIT_LIST, compactCards, holeLabel } from "@/lib/indicators";
import {
  HERO_SEAT,
  POS_6,
  SEAT_COUNT,
  STAT_FIELDS,
  advanceButton,
  buttonForHeroPosition,
  classify,
  emptySeats,
  emptyStats,
  hasRead,
  heroPosition,
  positionOf,
  seatOfPosition
} from "@/lib/villains";
import { legalActions, recommend } from "@/lib/preflop";

const SEATS_KEY = "hl-live-seats-v2";
const HAND_KEY = "hl-live-hand-v2";

const ACTION_LABEL = {
  fold: "Fold",
  limp: "Limp",
  open: "Open",
  call: "Call",
  "3bet": "3-bet",
  "4bet": "4-bet",
  check: "Check"
};

function emptyHand(buttonSeat = 0) {
  return {
    buttonSeat,
    hole: [null, null],
    actions: Object.fromEntries(POS_6.map((pos) => [pos, ""]))
  };
}

function loadSeats() {
  const base = emptySeats();
  try {
    const parsed = JSON.parse(localStorage.getItem(SEATS_KEY) || "null");
    if (!Array.isArray(parsed) || parsed.length !== SEAT_COUNT) return base;
    return base.map((seat, i) => ({ ...seat, stats: { ...seat.stats, ...parsed[i]?.stats } }));
  } catch {
    return base;
  }
}

function loadHand() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(HAND_KEY) || "null");
    if (!parsed) return emptyHand();
    const buttonSeat = Number.isInteger(parsed.buttonSeat) ? parsed.buttonSeat % SEAT_COUNT : 0;
    return {
      ...emptyHand(buttonSeat),
      hole: [parsed.hole?.[0] || null, parsed.hole?.[1] || null],
      actions: { ...emptyHand().actions, ...parsed.actions }
    };
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
  const [seats, setSeats] = useState(emptySeats);
  const [hand, setHand] = useState(emptyHand);
  const [picker, setPicker] = useState(null);
  const [editSeatId, setEditSeatId] = useState(1);
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

  const heroPos = heroPosition(hand.buttonSeat);
  const nextHeroPos = heroPosition(advanceButton(hand.buttonSeat));
  const used = useMemo(() => new Set(compactCards(hand.hole)), [hand.hole]);
  const seatsByPos = useMemo(
    () => Object.fromEntries(POS_6.map((pos) => [pos, seats[seatOfPosition(pos, hand.buttonSeat)]])),
    [seats, hand.buttonSeat]
  );
  const rec = useMemo(
    () => recommend({ hole: hand.hole, heroPos, actions: hand.actions, seats: seatsByPos }),
    [hand.hole, hand.actions, heroPos, seatsByPos]
  );
  const ahead = POS_6.slice(0, POS_6.indexOf(heroPos));
  const editSeat = seats[editSeatId] || seats[1];
  const editPos = positionOf(editSeatId, hand.buttonSeat);
  const pickCode = picker != null ? hand.hole[picker] : null;

  const setHeroPos = (pos) => {
    setHand((h) => ({
      ...emptyHand(buttonForHeroPosition(pos)),
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

  const patchSeat = (id, patch) => {
    setSeats((list) => list.map((seat) => (seat.id === id ? { ...seat, ...patch, stats: { ...seat.stats, ...(patch.stats || {}) } } : seat)));
  };

  const nextHand = () => {
    setPicker(null);
    setHand((h) => emptyHand(advanceButton(h.buttonSeat)));
  };

  return (
    <div className="page live-page">
      <div className="live-top">
        <div>
          <span className="tag">LIVE · 6-MAX HUD</span>
          <h1>Tag the table. Get a mix.</h1>
          <p>테이블 아래 10칸 HUD에 숫자를 넣으세요. Next hand는 딜러 버튼을 다음 자리로 옮기고 카드를 지웁니다.</p>
        </div>
        <button className="ghost" type="button" onClick={nextHand}>
          <RotateCcw /> Next hand · {nextHeroPos}
        </button>
      </div>

      <section className="live-felt-card">
        <small>THIS HAND YOU ARE</small>
        <div className="live-chips">
          {POS_6.map((pos) => (
            <button key={pos} type="button" className={heroPos === pos ? "on" : ""} onClick={() => setHeroPos(pos)}>
              {pos}
            </button>
          ))}
        </div>
        <div className="live-felt">
          {seats.map((seat) => {
            const pos = positionOf(seat.id, hand.buttonSeat);
            const isHero = seat.id === HERO_SEAT;
            const isBtn = pos === "BTN";
            const acted = hand.actions[pos];
            const read = classify(seat);
            return (
              <button
                key={seat.id}
                type="button"
                className={`live-seat live-seat-${seat.id}${isHero ? " hero" : ""}${hasRead(seat) ? " tagged" : ""}${editSeatId === seat.id && !isHero ? " selected" : ""}`}
                onClick={() => {
                  if (!isHero) setEditSeatId(seat.id);
                }}
              >
                {isBtn ? <i className="live-dealer">D</i> : null}
                <b>
                  {pos}
                  {isHero ? " · YOU" : ""}
                </b>
                <span>{isHero ? holeLabel(hand.hole) || "Your cards" : hasRead(seat) ? read.label : "Tap · 10 HUD stats"}</span>
                {acted ? <em>{ACTION_LABEL[acted]}</em> : null}
              </button>
            );
          })}
          <div className="live-felt-core">D = dealer · Next hand moves it</div>
        </div>
        <p className="live-felt-hint">
          You are {heroPos}. Next hand you become {nextHeroPos}. HUD stays on the same people.
        </p>
      </section>

      <section className="live-hud-panel">
        <small>10 HUD STATS</small>
        <div className="live-picker-head">
          <b>
            {editPos}
            {hasRead(editSeat) ? ` · ${classify(editSeat).label}` : " · tap a seat"}
          </b>
          <button type="button" className="ghost" onClick={() => patchSeat(editSeatId, { stats: emptyStats() })}>
            Clear
          </button>
        </div>
        <div className={"live-type-badge" + (hasRead(editSeat) ? " on" : "")}>
          <small>PLAYER TYPE</small>
          <strong>{classify(editSeat).label}</strong>
        </div>
        <p className="live-editor-lead">자리를 탭한 뒤 VPIP부터 W$SD까지 10개를 입력하세요. 유형은 입력하는 즉시 바뀝니다.</p>
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
                value={editSeat?.stats?.[f.key] ?? ""}
                onChange={(e) => patchSeat(editSeatId, { stats: { [f.key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
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

      <section className={"live-rec" + (rec.action === "Fold" ? " fold" : rec.mix.length ? " go" : "")}>
        <small>RECOMMENDATION</small>
        <h2>{rec.headline}</h2>
        <b>{rec.detail}</b>
        {rec.mix.length ? (
          <div className="live-mix">
            {rec.mix.map((m) => (
              <div key={m.label}>
                <label>
                  <span>{m.label}</span>
                  <em>{m.pct}%</em>
                </label>
                <div className="live-mix-bar">
                  <i style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <p>{rec.reason}</p>
      </section>

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
