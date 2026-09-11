"use client";

import { useEffect, useRef, useState } from "react";
import { BrainCircuit, ChevronRight, Clock3, Heart, Star, Zap } from "lucide-react";
import { SOURCE, gradeChoice } from "@/lib/spots";
import { useT } from "@/lib/i18n";
import { FaceCard } from "./Card";

function cueKey(item) {
  if (item.street === "preflop") {
    if (!item.lineRaw) return "practice.cuePreflopOpen";
    if (item.bets >= 2) return "practice.cuePreflop3";
    return "practice.cuePreflopRaise";
  }
  if (item.street === "flop") return "practice.cueFlop";
  if (item.street === "turn") return "practice.cueTurn";
  return "practice.cueRiver";
}

export default function Practice({ item, idx, session, total, answer, choose, next, combo, xp, mode, lives }) {
  const { t } = useT();
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const answerRef = useRef(answer);
  const chooseRef = useRef(choose);
  const nextRef = useRef(next);
  const actions = item.moves;
  const actionsRef = useRef(actions);

  elapsedRef.current = elapsed;
  answerRef.current = answer;
  chooseRef.current = choose;
  nextRef.current = next;
  actionsRef.current = actions;

  useEffect(() => {
    setElapsed(0);
    if (answer) return;
    const timer = setInterval(() => setElapsed((s) => Math.min(30, s + 1)), 1000);
    return () => clearInterval(timer);
  }, [idx, answer]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = String(e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target?.isContentEditable) return;
      if (e.key >= "1" && e.key <= "9") {
        const move = actionsRef.current[Number(e.key) - 1];
        if (!answerRef.current && move) {
          e.preventDefault();
          chooseRef.current(move, elapsedRef.current);
        }
      }
      if ((e.key === " " || e.key === "Enter") && answerRef.current) {
        e.preventDefault();
        nextRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
  const gradeLabel =
    grade === "optimal" ? t("practice.preferredGrade") : grade === "close" ? t("practice.closeGrade") : t("practice.reviewGrade");

  return (
    <div className="page practice">
      <div className="game-hud">
        <div className="hud-level">
          <Star />
          <span>
            {t("practice.level", { n: Math.floor(xp / 400) + 1 })}
            <i>
              <b style={{ width: `${(xp % 400) / 4}%` }} />
            </i>
          </span>
        </div>
        <div className={"hud-combo " + (combo > 1 ? "hot" : "")}>
          <Zap /> {t("practice.comboLine", { mode: t(`modes.${mode}`), n: Math.max(1, combo) })}
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
              <small>{mode === "learn" ? t("practice.thinking") : t("practice.speedXp", { n: speedBonus })}</small>
            </div>
            <div className="villain">
              {t("practice.action")}
              <small>{item.villain}</small>
            </div>
            <div className="pot">
              <i className="chip chip1" />
              <i className="chip chip2" />
              {t("practice.pot")} <b>{item.pot}</b>
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
            <div className="you">{t("practice.you", { pos: item.pos })}</div>
            {answer && (
              <div className={"table-burst " + (grade !== "review" ? "win" : "lose")}>
                {grade === "optimal" ? (
                  <>
                    <Star /> {t("practice.nice")}
                  </>
                ) : grade === "close" ? (
                  <>
                    <Zap /> {t("practice.close")}
                  </>
                ) : (
                  t("practice.review")
                )}
              </div>
            )}
          </div>
          <div className="decision">
            <small>{t("practice.decision")}</small>
            <h2>{t("practice.question")}</h2>
            <div className="actions">
              {actions.map((a, i) => (
                <button
                  key={a}
                  className={
                    answer ? (a === item.a ? "right" : a === answer && grade === "close" ? "right" : a === answer ? "wrong" : "dim") : ""
                  }
                  onClick={() => choose(a, elapsed)}
                >
                  <em className="hotkey-num">{i + 1}</em>
                  {a}
                  <small>{answer ? (a === item.a ? t("practice.solverPick") : a === answer ? t("practice.yourChoice") : t("practice.legal")) : t("practice.legal")}</small>
                </button>
              ))}
            </div>
            <div className="hotkeys">{mode === "learn" ? t("practice.keysLearn") : t("practice.keysDrill")}</div>
          </div>
        </section>
        <aside className="analysis">
          <span className="label">{t("practice.solverLabel")}</span>
          {answer ? (
            <>
              <div className={"verdict " + (grade !== "review" ? "good" : "bad")}>
                <b>
                  +{points} XP · {gradeLabel}
                </b>
                <span>
                  {item.source} · {item.dataset} argmax
                </span>
              </div>
              <div className="solver-source">
                <small>{t("practice.preferred")}</small>
                <b>{item.a}</b>
                <span>
                  {SOURCE.game}. {SOURCE.preflop} / {SOURCE.postflop}.
                </span>
              </div>
              <div className="line-read">
                <small>{t("practice.line")}</small>
                <p>{item.line}</p>
              </div>
              <div className="explain">
                <small>{t("practice.why")}</small>
                <p>{t("practice.whyBody", { source: item.source, action: item.a })}</p>
              </div>
              <div className="coach">
                <small>{t("practice.cue")}</small>
                <p>{t(cueKey(item))}</p>
              </div>
              <button className="cta next" onClick={next}>
                {t("practice.next")} <ChevronRight />
              </button>
            </>
          ) : (
            <div className="waiting">
              <BrainCircuit />
              <h3>{t("practice.waiting")}</h3>
              <p>{item.line}</p>
              <div className="mini-quest">
                <Zap />
                <span>
                  <b>{t("practice.quest")}</b> {t("practice.questBody")}
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
      <p className="disclaimer">{t("practice.disclaimer", { name: SOURCE.name, preflop: SOURCE.preflop, postflop: SOURCE.postflop })}</p>
    </div>
  );
}
