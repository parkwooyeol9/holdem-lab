"use client";

import { ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { SPOTS, pct } from "@/lib/spots";

export default function Summary({ results, mode, start, reviewQueue, goHome }) {
  const good = results.filter((r) => r.ok).length;
  const xp = results.reduce((s, r) => s + (r.points || 0), 0);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + (r.seconds || 0), 0) / results.length) : 0;
  const ev = results.reduce((s, r) => s + (r.evLoss || 0), 0);
  const strongest = results.length ? SPOTS[results.slice().sort((a, b) => (b.frequency || 0) - (a.frequency || 0))[0].hand].level : "—";

  return (
    <div className="page summary-page">
      <div className="summary-hero">
        <div className="summary-trophy">
          <Trophy />
        </div>
        <span className="tag">{mode.toUpperCase()} SESSION COMPLETE</span>
        <h1>{good >= 4 ? "Sharp decisions." : good >= 2 ? "Good foundation." : "Useful mistakes."}</h1>
        <p>Every result has been added to your learning profile and review queue.</p>
        <div className="session-score">
          <b>{xp}</b>
          <small>SESSION XP</small>
        </div>
      </div>
      <div className="summary-stats">
        <article>
          <small>QUALITY SCORE</small>
          <b>{pct(good, results.length)}%</b>
          <span>
            {good} of {results.length} profitable choices
          </span>
        </article>
        <article>
          <small>AVERAGE TIME</small>
          <b>{avg}s</b>
          <span>per decision</span>
        </article>
        <article>
          <small>EV LOST</small>
          <b>{ev.toFixed(2)}</b>
          <span>big blinds across this session</span>
        </article>
        <article>
          <small>STRONGEST AREA</small>
          <b className="text-stat">{strongest}</b>
          <span>based on choice frequency</span>
        </article>
      </div>
      <div className="summary-breakdown">
        <div className="summary-head">
          <div>
            <small>HAND-BY-HAND</small>
            <h2>Your five-decision replay</h2>
          </div>
          <span>Optimal · Mixed · Review</span>
        </div>
        {results.map((r, i) => (
          <div className="summary-row" key={r.id}>
            <span className={`grade-dot ${r.grade || (r.ok ? "optimal" : "review")}`}>{i + 1}</span>
            <div>
              <b>{SPOTS[r.hand].spot}</b>
              <small>
                {SPOTS[r.hand].cards.join(" ")} · chose {r.choice}
              </small>
            </div>
            <span>{r.frequency ?? SPOTS[r.hand].mix[r.choice] ?? 0}% frequency</span>
            <span>{(r.evLoss || 0).toFixed(2)} BB loss</span>
            <b>+{r.points || 0} XP</b>
          </div>
        ))}
      </div>
      <div className="summary-actions">
        <button className="ghost" onClick={goHome}>
          Back home
        </button>
        <button className="ghost" disabled={!reviewQueue.length} onClick={() => start(0, "review", reviewQueue)}>
          <RotateCcw /> Review weak spots
        </button>
        <button className="cta" onClick={() => start(Math.floor(Math.random() * SPOTS.length), mode)}>
          Play another session <ChevronRight />
        </button>
      </div>
    </div>
  );
}
