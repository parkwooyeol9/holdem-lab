"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, ChevronRight, Clock3, Heart, Star, Zap } from "lucide-react";
import { SPOTS } from "@/lib/spots";
import { FaceCard } from "./Card";

export default function Practice({ item, idx, answer, choose, next, combo, xp, mode, lives }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    if (answer) return;
    const t = setInterval(() => setElapsed((s) => Math.min(30, s + 1)), 1000);
    return () => clearInterval(t);
  }, [idx, answer]);

  const actions = Object.keys(item.mix);
  const speedBonus = 3 * Math.max(0, 15 - elapsed);
  const freq = (answer && item.mix[answer]) || 0;
  const bestEv = Math.max(...Object.values(item.ev).map(Number));
  const evLoss = answer ? Math.max(0, bestEv - Number(item.ev[answer])) : 0;
  const grade = answer ? (answer === item.a ? "optimal" : freq >= 25 || evLoss <= 0.25 ? "mixed" : "review") : null;
  const points =
    grade === "optimal"
      ? 80 + (mode === "learn" ? 0 : speedBonus + 10 * Math.min(combo, 5))
      : grade === "mixed"
        ? 55 + (mode === "learn" ? 0 : speedBonus + 10 * Math.min(combo, 5))
        : 15;
  const mixVals = Object.values(item.mix);

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
          <b>{idx + 1}</b> / {SPOTS.length}
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
              VILLAIN
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
                ) : grade === "mixed" ? (
                  <>
                    <Zap /> VALID MIX!
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
                  className={answer ? (a === item.a || (a === answer && grade === "mixed") ? "right" : a === answer ? "wrong" : "dim") : ""}
                  onClick={() => choose(a, elapsed)}
                >
                  {a}
                  <small>{item.ev[a]} EV</small>
                </button>
              ))}
            </div>
            <div className="hotkeys">
              {mode === "learn" ? "Take your time and focus on the reason behind each action." : "Faster decisions earn bonus XP and extend your combo."}
            </div>
          </div>
        </section>
        <aside className="analysis">
          <span className="label">SOLVER VIEW</span>
          {answer ? (
            <>
              <div className={"verdict " + (grade !== "review" ? "good" : "bad")}>
                <b>
                  +{points} XP · {grade === "optimal" ? "Preferred action" : grade === "mixed" ? "Valid mixed action" : "Review this spot"}
                </b>
                <span>
                  {freq}% solver frequency · {evLoss.toFixed(2)} BB EV loss
                </span>
              </div>
              <h3>Interactive strategy mix</h3>
              <div
                className="mix-donut"
                style={{
                  background: `conic-gradient(var(--cyan) 0 ${mixVals[0]}%,var(--blue) ${mixVals[0]}% ${mixVals[0] + (mixVals[1] || 0)}%,#ff6073 0)`
                }}
              >
                <span>
                  <b>{Math.max(...mixVals)}%</b>
                  max frequency
                </span>
              </div>
              {Object.entries(item.mix).map(([k, v]) => (
                <div className="mix" key={k}>
                  <label>
                    {k}
                    <b>{v}%</b>
                  </label>
                  <div>
                    <i style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
              <div className="explain">
                <small>WHY IT WORKS</small>
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
              <h3>Read the range</h3>
              <p>{mode === "learn" ? "Think through position, range and board texture. There is no speed pressure." : "Choose your action before the timer reaches 30 seconds for a speed bonus."}</p>
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
      <p className="disclaimer">Training strategies are curated educational examples, not live GTO Wizard outputs or gambling advice.</p>
    </div>
  );
}
