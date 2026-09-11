"use client";

import { ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { pct, safeSpot } from "@/lib/spots";

function gradeText(grade) {
  if (grade === "optimal") return "Solver action";
  if (grade === "close") return "Close sizing";
  return "Missed";
}

export default function Summary({ results, mode, start, reviewQueue, goHome }) {
  const good = results.filter((r) => r.ok).length;
  const xp = results.reduce((s, r) => s + (r.points || 0), 0);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + (r.seconds || 0), 0) / results.length) : 0;
  const exact = results.filter((r) => r.grade === "optimal").length;
  const streetScores = {};
  for (const r of results) {
    const street = safeSpot(r.hand).level;
    if (!streetScores[street]) streetScores[street] = { ok: 0, n: 0 };
    streetScores[street].n += 1;
    if (r.ok) streetScores[street].ok += 1;
  }
  const strongest =
    Object.entries(streetScores).sort((a, b) => b[1].ok / b[1].n - a[1].ok / a[1].n)[0]?.[0] || "—";

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
            {good} of {results.length} solver matches
          </span>
        </article>
        <article>
          <small>AVERAGE TIME</small>
          <b>{avg}s</b>
          <span>per decision</span>
        </article>
        <article>
          <small>EXACT MATCHES</small>
          <b>{exact}</b>
          <span>identical to the PokerBench label</span>
        </article>
        <article>
          <small>STRONGEST AREA</small>
          <b className="text-stat">{strongest}</b>
          <span>best street this session</span>
        </article>
      </div>
      <div className="summary-breakdown">
        <div className="summary-head">
          <div>
            <small>HAND-BY-HAND</small>
            <h2>Your five-decision replay</h2>
          </div>
          <span>Optimal · Close · Review</span>
        </div>
        {results.map((r, i) => {
          const spot = safeSpot(r.hand);
          const grade = r.grade || (r.ok ? "optimal" : "review");
          return (
            <div className="summary-row" key={r.id}>
              <span className={`grade-dot ${grade === "close" ? "mixed" : grade}`}>{i + 1}</span>
              <div>
                <b>{spot.spot}</b>
                <small>
                  {spot.cards.join(" ")} · chose {r.choice}
                </small>
              </div>
              <span>{gradeText(grade)}</span>
              <span>solver {spot.a}</span>
              <b>+{r.points || 0} XP</b>
            </div>
          );
        })}
      </div>
      <div className="summary-actions">
        <button className="ghost" onClick={goHome}>
          Back home
        </button>
        <button className="ghost" disabled={!reviewQueue.length} onClick={() => start("all", "review", reviewQueue)}>
          <RotateCcw /> Review weak spots
        </button>
        <button className="cta" onClick={() => start("all", mode)}>
          Play another session <ChevronRight />
        </button>
      </div>
    </div>
  );
}
