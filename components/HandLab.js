"use client";

import { useState } from "react";
import { BrainCircuit, Microscope, Plus, Search, Star, Trash2 } from "lucide-react";
import { FaceCard } from "./Card";

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS = [
  { value: "s", icon: "♠", name: "Spade" },
  { value: "h", icon: "♥", name: "Heart" },
  { value: "d", icon: "♦", name: "Diamond" },
  { value: "c", icon: "♣", name: "Club" }
];
const POSITIONS = ["UTG", "UTG+1", "Hijack", "Cutoff", "Button", "Small Blind", "Big Blind"];

function CardPicker({ card, onChange, label }) {
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
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function analyze(form) {
  const s = `${form.heroCards[0].rank}${form.heroCards[1].rank}${form.heroCards[0].suit === form.heroCards[1].suit ? "s" : "o"}`;
  const btn = form.actions.find((a) => a.position === "Button" && a.action === "Open");
  const sb = form.actions.find((a) => a.position === "Small Blind" && a.action === "All-in");
  if (form.street === "Preflop" && (s === "KQs" || s === "QKs") && btn && sb && form.heroPos === "Big Blind") {
    const icm = form.pressure !== "Chip EV / early stage";
    return {
      score: icm ? 61 : 84,
      verdict: icm ? "Close: payout pressure can make folding reasonable" : "Re-jam is generally preferred to folding",
      confidence: "Medium",
      explanation: icm
        ? "KQs has strong chip equity, but bubble, satellite or large pay-jump pressure can make survival value dominate. Exact payouts and stack distribution are required."
        : "KQs is well ahead of a typical 7BB Small Blind jam range and blocks strong Button continues. With 20BB, moving all-in applies maximum pressure to the Button and avoids playing a side pot out of position. Folding is usually too tight in a chip-EV setting.",
      columns: [
        { title: "SB 7BB jam", tone: "value", items: ["Many pairs", "Broadway aces and kings", "Suited aces and connected hands"] },
        { title: "BTN calls your jam", tone: "draw", items: ["Usually TT+/AQ+", "May widen versus aggressive image", "This residual risk lowers KQs value"] },
        { title: "Decision factors", tone: "bluff", items: ["Dead money ≈ 10.5BB before antes", "K/Q blockers help fold equity", "ICM can materially tighten the shove"] }
      ],
      conclusion: "Without meaningful ICM, shove > fold. Calling only 7BB is strategically awkward because the Button retains position and can reshove; the clean default is isolation all-in.",
      missing: ["Antes", "Tournament payouts", "BTN opening tendency", "BTN stack"]
    };
  }
  return {
    score: 65,
    verdict: "The spot is saved, but this beta has limited coverage",
    confidence: "Low",
    explanation: "The structured action sequence is now captured correctly. A reliable recommendation for this exact configuration still requires either a matching reviewed template or a solver calculation.",
    columns: [
      { title: "Strong range", tone: "value", items: ["Premium made hands", "High-equity continues", "Position-dependent value"] },
      { title: "Medium range", tone: "draw", items: ["Suited broadways", "Pairs and strong draws", "Pot-odds-dependent calls"] },
      { title: "Weak range", tone: "bluff", items: ["Blocker candidates", "Hands benefiting from fold equity", "Population-dependent actions"] }
    ],
    conclusion: "Use the output as a range-thinking checklist, not a GTO answer.",
    missing: ["Exact action sizes", "Antes", "Player tendencies", "Payout pressure"]
  };
}

export default function HandLab() {
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
    setResult(analyze(form));
  };

  return (
    <div className="page hand-lab-page">
      <div className="page-title split">
        <div>
          <span className="tag">HAND LAB · BETA 2</span>
          <h1>Build any preflop action sequence.</h1>
          <p>Select exact cards and add every player involved in a multiway pot.</p>
        </div>
        <div className="data-badge">
          <span>EXPERT-CURATED</span>
          <b>Structured analysis</b>
          <small>Not a live solver output</small>
        </div>
      </div>
      <div className="hand-lab-grid">
        <form className="hand-form" onSubmit={submit}>
          <div className="form-head">
            <Microscope />
            <div>
              <b>Scenario builder</b>
              <small>No suit symbols need to be typed.</small>
            </div>
          </div>
          <div className="form-grid">
            <label>
              <span>Street</span>
              <select value={form.street} onChange={setField("street")}>
                {["Preflop", "Flop", "Turn", "River"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Your position</span>
              <select value={form.heroPos} onChange={setField("heroPos")}>
                {POSITIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Your stack</span>
              <div className="input-suffix">
                <input type="number" value={form.heroStack} onChange={setField("heroStack")} />
                <b>BB</b>
              </div>
            </label>
            <label>
              <span>Average stack</span>
              <div className="input-suffix">
                <input type="number" value={form.averageStack} onChange={setField("averageStack")} />
                <b>BB</b>
              </div>
            </label>
          </div>
          <div className="hole-card-builder">
            <CardPicker label="Card 1" card={form.heroCards[0]} onChange={(c) => setCard(0, c)} />
            <CardPicker label="Card 2" card={form.heroCards[1]} onChange={(c) => setCard(1, c)} />
            <div className="hand-preview">
              <FaceCard c={`${form.heroCards[0].rank}${SUITS.find((s) => s.value === form.heroCards[0].suit).icon}`} />
              <FaceCard c={`${form.heroCards[1].rank}${SUITS.find((s) => s.value === form.heroCards[1].suit).icon}`} />
            </div>
          </div>
          <label className="pressure-field">
            <span>Tournament context</span>
            <select value={form.pressure} onChange={setField("pressure")}>
              {["Chip EV / early stage", "Regular payout pressure", "Bubble / major pay jump", "Satellite survival pressure"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <div className="action-builder">
            <div className="action-builder-head">
              <div>
                <span>ACTION SEQUENCE</span>
                <small>Add players in chronological order</small>
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
                <Plus /> Add action
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
                  <span>stack</span>
                </div>
                <select value={a.action} onChange={(e) => setAction(a.id, "action", e.target.value)}>
                  {["Fold", "Call", "Open", "Raise", "All-in", "Check", "Bet", "Check-raise"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <div className="mini-input">
                  <input type="number" step="0.1" value={a.size} onChange={(e) => setAction(a.id, "size", e.target.value)} />
                  <span>to BB</span>
                </div>
                <button type="button" className="delete-action" onClick={() => setForm((f) => ({ ...f, actions: f.actions.filter((x) => x.id !== a.id) }))}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
          <button className="cta analyze-button" type="submit">
            <Search /> Analyze this decision
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
                  <small>ACTION EVALUATION · {result.confidence.toUpperCase()} CONFIDENCE</small>
                  <h2>{result.verdict}</h2>
                  <p>{result.explanation}</p>
                </div>
              </div>
              <div className="range-answer">
                <small>MULTIWAY RANGE MAP</small>
                <h3>The player behind you matters as much as the short-stack jam.</h3>
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
                  <b>Practical default</b>
                  <p>{result.conclusion}</p>
                </div>
              </div>
              <div className="missing-data">
                <b>To improve confidence, add:</b>
                {result.missing.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="analysis-empty">
              <BrainCircuit />
              <h2>Your example is ready</h2>
              <p>K♠Q♠ in the Big Blind, facing a Button 2BB open and Small Blind 7BB all-in.</p>
              <button onClick={submit}>Analyze KQs decision</button>
            </div>
          )}
        </section>
      </div>
      <p className="disclaimer">Hand Lab uses reviewed poker heuristics rather than a solver. Tournament ICM, antes and player ranges can change the recommendation materially.</p>
    </div>
  );
}
