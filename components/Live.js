"use client";

import { useEffect, useMemo, useState } from "react";
import { Gauge, RotateCcw, X } from "lucide-react";
import Card from "./Card";
import {
  LIVE_STORAGE_KEY,
  POSITIONS,
  RANK_ORDER,
  SUIT_LIST,
  compactCards,
  emptySnapshot,
  indicators
} from "@/lib/indicators";

function loadSpot() {
  const base = emptySnapshot();
  try {
    const raw = sessionStorage.getItem(LIVE_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    const hole = [parsed.hole?.[0] || null, parsed.hole?.[1] || null];
    const board = [0, 1, 2, 3, 4].map((i) => parsed.board?.[i] || null);
    return { ...base, ...parsed, hole, board };
  } catch {
    return base;
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

function Metric({ label, value, hint, tone }) {
  return (
    <article className={"live-metric" + (tone ? ` ${tone}` : "")}>
      <small>{label}</small>
      <b>{value}</b>
      {hint ? <span>{hint}</span> : null}
    </article>
  );
}

export default function Live() {
  const [spot, setSpot] = useState(emptySnapshot);
  const [picker, setPicker] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSpot(loadSpot());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(spot));
    } catch {}
  }, [spot, hydrated]);

  const used = useMemo(() => new Set([...compactCards(spot.hole), ...compactCards(spot.board)]), [spot.hole, spot.board]);
  const hud = useMemo(() => indicators(spot), [spot]);

  const setField = (key, value) => setSpot((s) => ({ ...s, [key]: value }));
  const setCard = (zone, index, code) => {
    setSpot((s) => {
      const next = [...s[zone]];
      next[index] = code;
      return { ...s, [zone]: next };
    });
    setPicker(null);
  };
  const openPicker = (zone, index) => setPicker({ zone, index });

  const nextHand = () => {
    setPicker(null);
    setSpot((s) => ({
      ...emptySnapshot(),
      heroPos: s.heroPos,
      stacksBB: s.stacksBB,
      villains: s.villains
    }));
  };

  const pot = Number(spot.pot) || 0;
  const pickCode = picker ? spot[picker.zone][picker.index] : null;

  return (
    <div className="page live-page">
      <div className="live-top">
        <div>
          <span className="tag">LIVE COMPANION · MATH HUD</span>
          <h1>Glanceable odds. No solver claims.</h1>
          <p>Tap hole cards, board and pot. Numbers update for this street only.</p>
        </div>
        <button className="ghost" type="button" onClick={nextHand}>
          <RotateCcw /> Next hand
        </button>
      </div>

      <section className="live-cards">
        <div>
          <small>HOLE</small>
          <div className="live-slots">
            {spot.hole.map((c, i) => (
              <Slot
                key={`h${i}`}
                card={c}
                label={i === 0 ? "Card 1" : "Card 2"}
                onClick={() => openPicker("hole", i)}
                onClear={() => setCard("hole", i, null)}
              />
            ))}
          </div>
        </div>
        <div>
          <small>BOARD</small>
          <div className="live-slots">
            {spot.board.map((c, i) => (
              <Slot
                key={`b${i}`}
                card={c}
                label={i < 3 ? "Flop" : i === 3 ? "Turn" : "River"}
                onClick={() => openPicker("board", i)}
                onClear={() => setCard("board", i, null)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="live-context">
        <div className="live-field">
          <small>POSITION</small>
          <div className="live-chips">
            {POSITIONS.map((p) => (
              <button key={p} type="button" className={spot.heroPos === p ? "on" : ""} onClick={() => setField("heroPos", p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="live-nums">
          <label>
            <small>STACK</small>
            <div className="live-num">
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={spot.stacksBB}
                onChange={(e) => setField("stacksBB", e.target.value === "" ? "" : Number(e.target.value))}
              />
              <b>BB</b>
            </div>
            <div className="live-chips compact">
              {[20, 50, 100].map((n) => (
                <button key={n} type="button" className={Number(spot.stacksBB) === n ? "on" : ""} onClick={() => setField("stacksBB", n)}>
                  {n}
                </button>
              ))}
            </div>
          </label>
          <label>
            <small>POT</small>
            <div className="live-num">
              <input
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={spot.pot}
                onChange={(e) => setField("pot", e.target.value === "" ? "" : Number(e.target.value))}
              />
              <b>BB</b>
            </div>
            <div className="live-chips compact">
              {[3.5, 6, 12, 20].map((n) => (
                <button key={n} type="button" className={Number(spot.pot) === n ? "on" : ""} onClick={() => setField("pot", n)}>
                  {n}
                </button>
              ))}
            </div>
          </label>
          <label>
            <small>TO CALL</small>
            <div className="live-num">
              <input
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                value={spot.toCall}
                onChange={(e) => setField("toCall", e.target.value === "" ? "" : Number(e.target.value))}
              />
              <b>BB</b>
            </div>
            <div className="live-chips compact">
              <button type="button" className={Number(spot.toCall) === 0 ? "on" : ""} onClick={() => setField("toCall", 0)}>
                Check
              </button>
              <button type="button" disabled={!pot} onClick={() => setField("toCall", Math.round(pot * 5) / 10)}>
                ½ pot
              </button>
              <button type="button" disabled={!pot} onClick={() => setField("toCall", Math.round((pot * 2) / 3 * 10) / 10)}>
                ⅔ pot
              </button>
              <button type="button" disabled={!pot} onClick={() => setField("toCall", pot)}>
                Pot
              </button>
            </div>
          </label>
          <label>
            <small>VILLAINS</small>
            <div className="live-chips compact">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} type="button" className={Number(spot.villains) === n ? "on" : ""} onClick={() => setField("villains", n)}>
                  {n}
                </button>
              ))}
            </div>
          </label>
        </div>
      </section>

      <section className="live-hud">
        <div className="live-cue">
          <Gauge />
          <p>{hud.cue}</p>
        </div>
        <div className="live-metrics">
          <Metric label="HAND" value={hud.hand ? hud.hand.name : "—"} hint={hud.texture?.label || (hud.hand ? spot.heroPos : null)} />
          <Metric
            label="POT ODDS"
            value={!hud.ready ? "—" : hud.freePlay ? "Free" : hud.potOdds ? `${hud.potOdds.percent}%` : "—"}
            hint={!hud.ready ? "Needs pot" : hud.freePlay ? "No bet to call" : hud.potOdds ? `${hud.potOdds.ratio} : 1` : null}
          />
          <Metric
            label="NEED"
            value={!hud.ready || hud.need == null ? "—" : `${hud.need}%`}
            hint={hud.gettingPrice ? "Getting the price" : hud.need == null ? (hud.freePlay ? "Free play" : "Set a call amount") : "Short of the price"}
            tone={hud.gettingPrice ? "good" : hud.ready && hud.need != null && hud.gettingPrice === false ? "warn" : ""}
          />
          <Metric label="SPR" value={!hud.ready || hud.spr == null ? "—" : String(hud.spr)} hint={hud.ready ? "Effective stack / pot" : "Needs pot"} />
          <Metric
            label={hud.outs ? "OUTS / EQ" : "EQUITY"}
            value={
              !hud.ready
                ? "—"
                : hud.outs
                  ? `${hud.outs.count} · ${hud.equity ?? hud.outs.approx}%`
                  : hud.equity != null
                    ? `${hud.equity}%`
                    : "—"
            }
            hint={hud.ready ? `vs ${spot.villains} random` : "Needs hole + pot"}
          />
        </div>
      </section>

      {picker && (
        <div className="live-picker-scrim" onClick={() => setPicker(null)}>
          <div className="live-picker" onClick={(e) => e.stopPropagation()}>
            <div className="live-picker-head">
              <b>Pick a card</b>
              <button type="button" className="ghost" onClick={() => setCard(picker.zone, picker.index, null)}>
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
                        onClick={() => setCard(picker.zone, picker.index, code)}
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
