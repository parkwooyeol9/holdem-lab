"use client";

import { ChartNoAxesColumnIncreasing, RotateCcw } from "lucide-react";
import { MODULES, SPOTS, pct } from "@/lib/spots";

export default function Progress({ history, correct, filter, setFilter, reset }) {
  const rows = history.filter((h) => filter === "All" || (filter === "Correct" ? h.ok : !h.ok)).slice().reverse();
  const modules = [0, 1, 2].map((i) => {
    const plays = history.filter((h) => Math.floor(h.hand / 3) === i);
    return { name: MODULES[i][0], played: plays.length, score: pct(plays.filter((h) => h.ok).length, plays.length) };
  });
  const xp = history.reduce((s, h) => s + (h.points ?? (h.ok ? 80 : 15)), 0);

  return (
    <div className="page">
      <div className="page-title split">
        <div>
          <span className="tag">PERFORMANCE</span>
          <h1>Your decision journal.</h1>
          <p>See what is improving and which spots deserve another pass.</p>
        </div>
        <button className="ghost" onClick={reset}>
          <RotateCcw /> Reset progress
        </button>
      </div>
      <div className="metric-grid">
        <div>
          <small>HANDS PLAYED</small>
          <b>{history.length}</b>
          <span>Across {new Set(history.map((h) => h.hand)).size} unique spots</span>
        </div>
        <div>
          <small>ACCURACY</small>
          <b>{pct(correct, history.length)}%</b>
          <span>{correct} correct decisions</span>
        </div>
        <div>
          <small>XP EARNED</small>
          <b>{xp}</b>
          <span>Accuracy, speed and combo bonuses</span>
        </div>
      </div>
      <div className="chart-grid">
        <article className="accuracy-orbit">
          <div className="big-donut" style={{ background: `conic-gradient(var(--cyan) 0 ${pct(correct, history.length)}%,#1e2b35 0)` }}>
            <span>
              <b>{pct(correct, history.length)}%</b>
              accuracy
            </span>
          </div>
          <div>
            <small>SKILL PULSE</small>
            <h2>Decision quality</h2>
            <p>{history.length ? "Your chart updates after every hand. Keep playing to fill the ring." : "Play your first hand to activate the chart."}</p>
          </div>
        </article>
        <article className="module-chart">
          <small>MODULE MASTERY</small>
          {modules.map((m) => (
            <div className="mastery" key={m.name}>
              <label>
                <b>{m.name}</b>
                <span>
                  {m.played} played · {m.score}%
                </span>
              </label>
              <div>
                <i style={{ width: `${m.score}%` }} />
                <em style={{ left: `${m.score}%` }} />
              </div>
            </div>
          ))}
        </article>
        <article className="decision-map">
          <small>DECISION MAP</small>
          <div className="heatmap">
            {SPOTS.map((spot, i) => {
              const plays = history.filter((h) => h.hand === i);
              const score = pct(plays.filter((h) => h.ok).length, plays.length);
              return (
                <button key={i} title={`${spot.spot}: ${plays.length ? plays.length + " attempts" : "unplayed"}`} className={plays.length ? (score >= 70 ? "great" : score >= 40 ? "mid" : "low") : "empty"}>
                  {i + 1}
                  <span>{plays.length ? score + "%" : "—"}</span>
                </button>
              );
            })}
          </div>
          <p>Hover each tile to inspect a training spot.</p>
        </article>
      </div>
      <div className="journal">
        <div className="journal-head">
          <h2>Recent decisions</h2>
          <div>
            {["All", "Correct", "Review"].map((f) => (
              <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        {rows.length ? (
          rows.map((h) => (
            <div className="row" key={h.id}>
              <span className={h.ok ? "ok" : "no"}>{h.ok ? "✓" : "!"}</span>
              <div>
                <b>{SPOTS[h.hand].spot}</b>
                <small>
                  {SPOTS[h.hand].pos} · {SPOTS[h.hand].cards.join(" ")}
                </small>
              </div>
              <span>
                You chose <b>{h.choice}</b>
              </span>
              <span>
                <b>+{h.points ?? (h.ok ? 80 : 15)} XP</b>
              </span>
            </div>
          ))
        ) : (
          <div className="empty">
            <ChartNoAxesColumnIncreasing />
            <h3>No decisions here yet</h3>
            <p>Play a training hand and your result will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
