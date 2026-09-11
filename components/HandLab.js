"use client";

import { useState } from "react";
import { BrainCircuit, Microscope, Plus, Search, Star, Trash2 } from "lucide-react";
import { FaceCard } from "./Card";
import { analyzeHand } from "@/lib/handlab";
import { useT } from "@/lib/i18n";

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = [
  { value: "s", icon: "♠", key: "suitS" },
  { value: "h", icon: "♥", key: "suitH" },
  { value: "d", icon: "♦", key: "suitD" },
  { value: "c", icon: "♣", key: "suitC" }
];
const POSITIONS = ["UTG", "UTG+1", "Hijack", "Cutoff", "Button", "Small Blind", "Big Blind"];
const PRESSURES = [
  ["Chip EV / early stage", "pressure0"],
  ["Regular payout pressure", "pressure1"],
  ["Bubble / major pay jump", "pressure2"],
  ["Satellite survival pressure", "pressure3"]
];

function CardPicker({ card, onChange, label, t }) {
  return (
    <div className="card-picker">
      <span>{label}</span>
      <div>
        <select value={card.rank} onChange={(e) => onChange({ ...card, rank: e.target.value })}>
          {RANKS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <select className={card.suit === "h" || card.suit === "d" ? "red-suit" : ""} value={card.suit} onChange={(e) => onChange({ ...card, suit: e.target.value })}>
          {SUITS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.icon} {t(`handlab.${s.key}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function HandLab() {
  const { t } = useT();
  const [form, setForm] = useState({
    street: "Preflop",
    heroCards: [
      { rank: "K", suit: "s" },
      { rank: "Q", suit: "s" }
    ],
    heroPos: "Big Blind",
    heroStack: "20",
    averageStack: "30",
    pressure: "Chip EV / early stage",
    actions: [
      { id: 1, position: "Button", stack: "30", action: "Open", size: "2" },
      { id: 2, position: "Small Blind", stack: "7", action: "All-in", size: "7" }
    ]
  });
  const [result, setResult] = useState(null);
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setCard = (i, card) => setForm((f) => ({ ...f, heroCards: f.heroCards.map((c, n) => (n === i ? card : c)) }));
  const setAction = (id, key, value) => setForm((f) => ({ ...f, actions: f.actions.map((a) => (a.id === id ? { ...a, [key]: value } : a)) }));
  const submit = (e) => {
    e?.preventDefault?.();
    setResult(analyzeHand(form));
  };

  return (
    <div className="page hand-lab-page">
      <div className="page-title split">
        <div>
          <span className="tag">{t("handlab.tag")}</span>
          <h1>{t("handlab.title")}</h1>
          <p>{t("handlab.blurb")}</p>
        </div>
        <div className="data-badge">
          <span>{t("handlab.badge")}</span>
          <b>{t("handlab.badgeTitle")}</b>
          <small>{t("handlab.badgeNote")}</small>
        </div>
      </div>
      <div className="hand-lab-grid">
        <form className="hand-form" onSubmit={submit}>
          <div className="form-head">
            <Microscope />
            <div>
              <b>{t("handlab.builder")}</b>
              <small>{t("handlab.builderHint")}</small>
            </div>
          </div>
          <div className="form-grid">
            <label>
              <span>{t("handlab.street")}</span>
              <select value={form.street} onChange={setField("street")}>
                {["Preflop", "Flop", "Turn", "River"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("handlab.position")}</span>
              <select value={form.heroPos} onChange={setField("heroPos")}>
                {POSITIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{t("handlab.stack")}</span>
              <div className="input-suffix">
                <input type="number" value={form.heroStack} onChange={setField("heroStack")} />
                <b>BB</b>
              </div>
            </label>
            <label>
              <span>{t("handlab.avgStack")}</span>
              <div className="input-suffix">
                <input type="number" value={form.averageStack} onChange={setField("averageStack")} />
                <b>BB</b>
              </div>
            </label>
          </div>
          <div className="hole-card-builder">
            <CardPicker label={t("handlab.card1")} card={form.heroCards[0]} onChange={(c) => setCard(0, c)} t={t} />
            <CardPicker label={t("handlab.card2")} card={form.heroCards[1]} onChange={(c) => setCard(1, c)} t={t} />
            <div className="hand-preview">
              <FaceCard c={`${form.heroCards[0].rank}${SUITS.find((s) => s.value === form.heroCards[0].suit).icon}`} />
              <FaceCard c={`${form.heroCards[1].rank}${SUITS.find((s) => s.value === form.heroCards[1].suit).icon}`} />
            </div>
          </div>
          <label className="pressure-field">
            <span>{t("handlab.pressure")}</span>
            <select value={form.pressure} onChange={setField("pressure")}>
              {PRESSURES.map(([value, key]) => (
                <option key={value} value={value}>
                  {t(`handlab.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="action-builder">
            <div className="action-builder-head">
              <div>
                <span>{t("handlab.sequence")}</span>
                <small>{t("handlab.sequenceHint")}</small>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    actions: [...f.actions, { id: Date.now(), position: "Cutoff", stack: "30", action: "Call", size: "2" }]
                  }))
                }
              >
                <Plus /> {t("handlab.add")}
              </button>
            </div>
            {form.actions.map((a, i) => (
              <div className="action-row" key={a.id}>
                <b>{i + 1}</b>
                <select value={a.position} onChange={(e) => setAction(a.id, "position", e.target.value)}>
                  {POSITIONS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <div className="mini-input">
                  <input type="number" value={a.stack} onChange={(e) => setAction(a.id, "stack", e.target.value)} />
                  <span>{t("handlab.stackMini")}</span>
                </div>
                <select value={a.action} onChange={(e) => setAction(a.id, "action", e.target.value)}>
                  {["Fold", "Call", "Open", "Raise", "All-in", "Check", "Bet", "Check-raise"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <div className="mini-input">
                  <input type="number" step="0.1" value={a.size} onChange={(e) => setAction(a.id, "size", e.target.value)} />
                  <span>{t("handlab.toBb")}</span>
                </div>
                <button type="button" className="delete-action" onClick={() => setForm((f) => ({ ...f, actions: f.actions.filter((x) => x.id !== a.id) }))}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <button className="cta analyze-button" type="submit">
            <Search /> {t("handlab.analyze")}
          </button>
        </form>
        <section className="hand-result">
          {result ? (
            <>
              <div className="result-score">
                <div className="score-ring" style={{ background: `conic-gradient(var(--cyan) 0 ${result.score}%,#25333d 0)` }}>
                  <span>
                    <b>{result.score}</b>/100
                  </span>
                </div>
                <div>
                  <small>{t("handlab.eval", { conf: result.confidence.toUpperCase() })}</small>
                  <h2>{result.verdict}</h2>
                  <p>{result.explanation}</p>
                </div>
              </div>
              <div className="range-answer">
                <small>{t("handlab.rangeMap")}</small>
                <h3>{t("handlab.rangeTitle")}</h3>
                <div className="range-columns">
                  {result.columns.map((col) => (
                    <article key={col.title} className={`range-${col.tone}`}>
                      <b>{col.title}</b>
                      {col.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </article>
                  ))}
                </div>
              </div>
              <div className="example-conclusion">
                <Star />
                <div>
                  <b>{t("handlab.practical")}</b>
                  <p>{result.conclusion}</p>
                </div>
              </div>
              <div className="missing-data">
                <b>{t("handlab.improve")}</b>
                {result.missing.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="analysis-empty">
              <BrainCircuit />
              <h2>{t("handlab.ready")}</h2>
              <p>{t("handlab.readyBody")}</p>
              <button onClick={submit}>{t("handlab.analyzeKq")}</button>
            </div>
          )}
        </section>
      </div>
      <p className="disclaimer">{t("handlab.disclaimer")}</p>
    </div>
  );
}
