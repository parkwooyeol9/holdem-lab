"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, RotateCcw, X } from "lucide-react";
import Card from "./Card";
import { RANK_ORDER, SUIT_LIST, compactCards, holeLabel } from "@/lib/indicators";
import {
  HERO_SEAT,
  POS_6,
  PREFLOP_ORDER,
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
import { FLOP_ACTION_LABEL, alivePositions, flopStreet, legalFlopActions, recommendFlop } from "@/lib/flop";
import { useT } from "@/lib/i18n";

const SEATS_KEY = "hl-live-seats-v2";
const HAND_KEY = "hl-live-hand-v3";

const ACTION_LABEL = {
  fold: "Fold",
  limp: "Limp",
  open: "Open",
  call: "Call",
  "3bet": "3-bet",
  "4bet": "4-bet",
  check: "Check",
  bet: "Bet",
  raise: "Raise"
};

function emptyHand(buttonSeat = 0) {
  return {
    buttonSeat,
    street: "preflop",
    hole: [null, null],
    flop: [null, null, null],
    actions: Object.fromEntries(POS_6.map((pos) => [pos, ""])),
    flopActions: Object.fromEntries(POS_6.map((pos) => [pos, ""]))
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
      flop: [parsed.flop?.[0] || null, parsed.flop?.[1] || null, parsed.flop?.[2] || null],
      actions: { ...emptyHand().actions, ...parsed.actions },
      flopActions: { ...emptyHand().flopActions, ...parsed.flopActions },
      street: parsed.street === "flop" ? "flop" : "preflop"
    };
  } catch {
    return emptyHand();
  }
}

function Slot({ card, label, onClick, onClear, compact }) {
  return (
    <div className={"live-slot-wrap" + (card ? " filled" : "") + (compact ? " board" : "")}>
      <button type="button" className={"live-slot" + (card ? "" : " empty")} onClick={onClick} aria-label={label}>
        {card ? <Card c={card} mini={compact} /> : <span>+</span>}
      </button>
      {compact ? null : <small>{label}</small>}
      {card ? (
        <button type="button" className="live-slot-clear" onClick={onClear} aria-label={`Clear ${label}`}>
          <X />
        </button>
      ) : null}
    </div>
  );
}

export default function Live() {
  const { t } = useT();
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
  const used = useMemo(() => new Set(compactCards([...(hand.hole || []), ...(hand.flop || [])])), [hand.hole, hand.flop]);
  const seatsByPos = useMemo(
    () => Object.fromEntries(POS_6.map((pos) => [pos, seats[seatOfPosition(pos, hand.buttonSeat)]])),
    [seats, hand.buttonSeat]
  );
  const rec = useMemo(() => {
    if (hand.street === "flop") {
      return recommendFlop({
        hole: hand.hole,
        flop: hand.flop,
        heroPos,
        actions: hand.actions,
        flopActions: hand.flopActions,
        seats: seatsByPos
      });
    }
    return recommend({ hole: hand.hole, heroPos, actions: hand.actions, seats: seatsByPos });
  }, [hand.street, hand.hole, hand.flop, hand.actions, hand.flopActions, heroPos, seatsByPos]);
  const flopRows = flopStreet(hand.actions, heroPos);
  const flopAlive = alivePositions(hand.actions, heroPos);
  const editSeat = seats[editSeatId] || seats[1];
  const editRead = classify(editSeat);
  const editPos = positionOf(editSeatId, hand.buttonSeat);
  const pickCode = picker?.pile === "flop" ? hand.flop?.[picker.index] : picker ? hand.hole[picker.index] : null;

  const setHeroPos = (pos) => {
    setHand((h) => ({
      ...emptyHand(buttonForHeroPosition(pos)),
      hole: h.hole
    }));
  };

  const setCard = (pile, index, code) => {
    setHand((h) => {
      if (pile === "flop") {
        const flop = [...(h.flop || [null, null, null])];
        flop[index] = code;
        return { ...h, flop };
      }
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

  const setFlopAction = (pos, action) => {
    setHand((h) => {
      const cur = h.flopActions || {};
      const flopActions = { ...cur, [pos]: cur[pos] === action ? "" : action };
      const hp = heroPosition(h.buttonSeat);
      const alive = alivePositions(h.actions, hp);
      const idx = alive.indexOf(pos);
      for (const later of alive.slice(idx + 1)) {
        if (!flopActions[later]) continue;
        if (!legalFlopActions(flopActions, later, alive).includes(flopActions[later])) flopActions[later] = "";
      }
      return { ...h, flopActions };
    });
  };

  const patchSeat = (id, patch) => {
    setSeats((list) => list.map((seat) => (seat.id === id ? { ...seat, ...patch, stats: { ...seat.stats, ...(patch.stats || {}) } } : seat)));
  };

  const nextHand = () => {
    setPicker(null);
    setHand((h) => emptyHand(advanceButton(h.buttonSeat)));
  };

  const goFlop = () => {
    setPicker(null);
    setHand((h) => ({
      ...h,
      street: "flop",
      flop: h.flop?.[0] || h.flop?.[1] || h.flop?.[2] ? h.flop : [null, null, null],
      flopActions: h.street === "flop" ? h.flopActions : Object.fromEntries(POS_6.map((pos) => [pos, ""]))
    }));
  };

  return (
    <div className="page live-page">
      <div className="live-top">
        <div>
          <span className="tag">{t("live.tag")}</span>
          <h1>{t("live.title")}</h1>
          <p>{t("live.blurb")}</p>
        </div>
        <div className="live-top-actions">
          <button className={"ghost" + (hand.street === "flop" ? " on" : "")} type="button" onClick={goFlop}>
            <Layers /> {t("live.postflop")}
          </button>
          <button className="ghost" type="button" onClick={nextHand}>
            <RotateCcw /> {t("live.next", { pos: nextHeroPos })}
          </button>
        </div>
      </div>

      <section className="live-felt-card">
        <small>{t("live.youAre")}</small>
        <div className="live-chips">
          {POS_6.map((pos) => (
            <button key={pos} type="button" className={heroPos === pos ? "on" : ""} onClick={() => setHeroPos(pos)}>
              {pos}
            </button>
          ))}
        </div>
        <div className="live-hole-row">
          <small>{t("live.yourHand")}</small>
          <div className="live-slots compact">
            {hand.hole.map((c, i) => (
              <Slot
                key={`h${i}`}
                card={c}
                compact
                label={i === 0 ? t("handlab.card1") : t("handlab.card2")}
                onClick={() => setPicker({ pile: "hole", index: i })}
                onClear={() => setCard("hole", i, null)}
              />
            ))}
          </div>
        </div>
        <div className={"live-felt" + (hand.street === "flop" ? " has-board" : "")}>
          {seats.map((seat) => {
            const pos = positionOf(seat.id, hand.buttonSeat);
            const isHero = seat.id === HERO_SEAT;
            const isBtn = pos === "BTN";
            const acted = hand.street === "flop" ? hand.flopActions?.[pos] : hand.actions[pos];
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
                  {isHero ? ` · ${t("live.you")}` : ""}
                </b>
                <span>{isHero ? holeLabel(hand.hole) || t("live.yourCards") : hasRead(seat) ? read.label : t("live.tapHud")}</span>
                {acted ? <em>{ACTION_LABEL[acted]}</em> : null}
              </button>
            );
          })}
          <div className="live-board">
            {hand.street === "flop" ? (
              (hand.flop || [null, null, null]).map((c, i) => (
                <Slot
                  key={`f${i}`}
                  card={c}
                  compact
                  label={`Flop ${i + 1}`}
                  onClick={() => setPicker({ pile: "flop", index: i })}
                  onClear={() => setCard("flop", i, null)}
                />
              ))
            ) : (
              <button type="button" className="live-board-deal" onClick={goFlop}>
                {t("live.flopDeal")}
              </button>
            )}
          </div>
        </div>
        <p className="live-felt-hint">
          {hand.street === "flop"
            ? t("live.flopHint")
            : t("live.preHint", { hero: heroPos, next: nextHeroPos })}
        </p>
      </section>

      <section className="live-actions">
        <small>{t("live.preflop")}</small>
        <p>{t("live.preflopHelp")}</p>
        {PREFLOP_ORDER.map((pos) => {
          const you = pos === heroPos;
          const options = legalActions(hand.actions, pos);
          return (
            <div className={"live-action-row" + (you ? " you" : "")} key={`pre-${pos}`}>
              <b>
                {pos}
                {you ? ` · ${t("live.you")}` : ""}
              </b>
              {you ? (
                <span className="live-you-wait">{t("live.recYou")}</span>
              ) : (
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
              )}
            </div>
          );
        })}
      </section>

      {hand.street === "flop" ? (
        <section className="live-actions live-actions-post">
          <small>{t("live.postflopAct")}</small>
          <p>{t("live.postflopHelp")}</p>
          {flopRows.map(({ pos, folded, you }) => {
            const options = legalFlopActions(hand.flopActions, pos, flopAlive);
            const stored = hand.flopActions?.[pos];
            const current = stored || (options.includes("check") ? "check" : "");
            return (
              <div className={"live-action-row" + (you ? " you" : "") + (folded ? " folded" : "")} key={`post-${pos}`}>
                <b>
                  {pos}
                  {you ? ` · ${t("live.you")}` : ""}
                </b>
                {you ? (
                  <span className="live-you-wait">{t("live.flopRecYou")}</span>
                ) : folded ? (
                  <span className="live-you-wait">{t("live.folded")}</span>
                ) : (
                  <div className="live-chips compact">
                    {options.map((act) => (
                      <button
                        key={act}
                        type="button"
                        className={current === act ? "on" : ""}
                        onClick={() => setFlopAction(pos, act)}
                      >
                        {FLOP_ACTION_LABEL[act]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ) : null}

      <section className={"live-rec" + (rec.action === "Fold" ? " fold" : rec.mix.length ? " go" : "")}>
        <small>
          {hand.street === "flop"
            ? t("live.flopRec")
            : rec.source === "pokerbench"
              ? t("live.bench", { n: rec.benchN, table: rec.benchTable ? ` · ${rec.benchTable}` : "", pct: Math.round((rec.solverWeight || 0) * 100) })
              : rec.mix.length
                ? t("live.chartPrior")
                : t("live.rec")}
        </small>
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
        {rec.equity && hand.street !== "flop" ? (
          <div className="live-equity">
            <span>{t("live.equityVs", { vs: rec.equity.vs })}</span>
            <b>{rec.equity.pct}%</b>
            <small>
              {rec.equity.combos ? t("live.combos", { n: rec.equity.combos }) : t("live.randomRemainder")} · {t("live.samples", { n: rec.equity.samples })}
            </small>
          </div>
        ) : null}
        <p>{rec.reason}</p>
      </section>

      <section className="live-hud-panel">
        <small>{t("live.hud")}</small>
        <div className="live-picker-head">
          <b>
            {editPos}
            {hasRead(editSeat) ? ` · ${editRead.label}` : ` · ${t("live.tap")}`}
          </b>
          <button type="button" className="ghost" onClick={() => patchSeat(editSeatId, { stats: emptyStats() })}>
            {t("live.clear")}
          </button>
        </div>
        <div className={"live-type-badge" + (hasRead(editSeat) ? " on" : "")}>
          <small>{t("live.type")}</small>
          <strong>{editRead.label}</strong>
          <p className="live-exploit">{editRead.exploit}</p>
        </div>
        <p className="live-editor-lead">{t("live.hudLead")}</p>
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

      <section className="live-guide">
        <small>{t("live.guide")}</small>
        <h2>{t("live.guideTitle")}</h2>
        <p>{t("live.guideBody")}</p>
        <div className="live-guide-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("live.colStat")}</th>
                <th>{t("live.colWhat")}</th>
                <th>{t("live.colRule")}</th>
              </tr>
            </thead>
            <tbody>
              {STAT_FIELDS.map((f) => (
                <tr key={f.key}>
                  <th>{f.label}</th>
                  <td>{f.what}</td>
                  <td>{f.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {picker != null && (
        <div className="live-picker-scrim" onClick={() => setPicker(null)}>
          <div className="live-picker" onClick={(e) => e.stopPropagation()}>
            <div className="live-picker-head">
              <b>{picker.pile === "flop" ? t("live.pickFlop") : t("live.pickCard")}</b>
              <button type="button" className="ghost" onClick={() => setCard(picker.pile, picker.index, null)}>
                {t("live.clear")}
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
                        onClick={() => setCard(picker.pile, picker.index, code)}
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
