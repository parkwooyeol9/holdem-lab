"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, ChevronRight, Clock3, Heart, Star, Zap } from "lucide-react";
import { SOURCE, gradeChoice } from "@/lib/spots";
import { FaceCard } from "./Card";

function gradeLabel(grade) {
  if (grade === "optimal") return "Preferred action";
  if (grade === "close") return "Close sizing";
  return "Review this spot";
}

export default function Practice({ item, idx, session, total, answer, choose, next, combo, xp, mode, lives }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (answer) return;
    const t = setInterval(() => setElapsed((s) => Math.min(30, s + 1)), 1000);
    return () => clearInterval(t);
  }, [idx, answer]);

  const actions = item.moves;
  const speedBonus = 3 * Math.max(0, 15 - elapsed);
  const result = answer ? gradeChoice(item, answer) : null;
  const grade = result?.grade || null;
  const points =
    grade === "optimal"
      ? 80 + (mode === "learn" ? 0 : speedBonus + 10 * Math.min(combo, 5))
      : grade === "close"
        ? 55 + (mode === "learn" ? 0 : speedBonus + 10 * Math.min(combo, 5))
        : grade
          ? 15
          : 0;

  return (
    <div className="page practice">
      <div className="game-hud">
        <div className="hud-level">
          <Star />
          <span>
            LEVEL {Math.floor(xp / 400) + 1}
            <i>
              <b style={{ width: `${(xp % 400) / 4}%` }} />
            </i>
          </span>
        </div>
        <div className={"hud-combo " + (combo > 1 ? "hot" : "")}>
          <Zap /> {mode.toUpperCase()} · COMBO ×{Math.max(1, combo)}
        </div>
        <div className="hud-lives">
          {[0, 1, 2].map((n) => (
            <Heart key={n} className={n < lives ? "alive" : "lost"} />
          ))}
        </div>
      </div>
      <div className="practice-head">
        <div>
          <span className="tag">{item.level}</span>
          <h1>{item.spot}</h1>
        </div>
        <div>
          <b>{session}</b> / {total}
        </div>
      </div>
      <div className="trainer">
        <section className="table-wrap">
          <div className={"felt " + (answer ? "revealed" : "")}>
            <div className="timer-ring" style={{ "--time": `${Math.min((elapsed / 30) * 360, 360)}deg` }}>
              <Clock3 />
              <b>{elapsed}s</b>
              <small>{mode === "learn" ? "thinking time" : `+${speedBonus} speed XP`}</small>
            </div>
            <div className="villain">
              ACTION
              <small>{item.villain}</small>
            </div>
            <div className="pot">
              <i className="chip chip1" />
              <i className="chip chip2" />
              POT <b>{item.pot}</b>
            </div>
            <div className="board">
              {item.board.map((c, i) => (
                <FaceCard key={c + i} c={c} />
              ))}
            </div>
            <div className="hero-cards">
              {item.cards.map((c, i) => (
                <FaceCard key={c + i} c={c} />
              ))}
            </div>
            <div className="you">YOU · {item.pos}</div>
            {answer && (
              <div className={"table-burst " + (grade !== "review" ? "win" : "lose")}>
                {grade === "optimal" ? (
                  <>
                    <Star /> NICE READ!
                  </>
                ) : grade === "close" ? (
                  <>
                    <Zap /> CLOSE SIZING
                  </>
                ) : (
                  "ADD TO REVIEW"
                )}
              </div>
            )}
          </div>
          <div className="decision">
            <small>YOUR DECISION</small>
            <h2>{item.q}</h2>
            <div className="actions">
              {actions.map((a) => (
                <button
                  key={a}
                  className={
                    answer ? (a === item.a ? "right" : a === answer && grade === "close" ? "right" : a === answer ? "wrong" : "dim") : ""
                  }
                  onClick={() => choose(a, elapsed)}
                >
                  {a}
                  <small>{answer ? (a === item.a ? "solver pick" : a === answer ? "your choice" : "legal") : "legal action"}</small>
                </button>
              ))}
            </div>
            <div className="hotkeys">
              {mode === "learn" ? "Take your time and focus on the reason behind each action." : "Faster decisions earn bonus XP and extend your combo."}
            </div>
          </div>
        </section>
        <aside className="analysis">
          <span className="label">SOLVER LABEL</span>
          {answer ? (
            <>
              <div className={"verdict " + (grade !== "review" ? "good" : "bad")}>
                <b>
                  +{points} XP · {gradeLabel(grade)}
                </b>
                <span>
                  {item.source} · {item.dataset} argmax
                </span>
              </div>
              <div className="solver-source">
                <small>PREFERRED ACTION</small>
                <b>{item.a}</b>
                <span>
                  {SOURCE.game}. Preflop labels from {SOURCE.preflop}; postflop from {SOURCE.postflop}.
                </span>
              </div>
              <div className="line-read">
                <small>ACTION LINE</small>
                <p>{item.line}</p>
              </div>
              <div className="explain">
                <small>WHY THIS LABEL</small>
                <p>{item.why}</p>
              </div>
              <div className="coach">
                <small>COACHING CUE</small>
                <p>{item.cue}</p>
              </div>
              <button className="cta next" onClick={next}>
                Deal next hand <ChevronRight />
              </button>
            </>
          ) : (
            <div className="waiting">
              <BrainCircuit />
              <h3>Read the line</h3>
              <p>{item.line}</p>
              <div className="mini-quest">
                <Zap />
                <span>
                  <b>Side quest</b> Build a 3-hand combo
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
      <p className="disclaimer">
        {SOURCE.name} test spots · {SOURCE.preflop} preflop / {SOURCE.postflop} postflop · highest-frequency GTO action only · not gambling
        advice.
      </p>
    </div>
  );
}
