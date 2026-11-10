"use client";

import { ChartNoAxesColumnIncreasing, RotateCcw } from "lucide-react";
import { MODULES, SPOTS, pct, safeSpot } from "@/lib/spots";
import { useT } from "@/lib/i18n";

const FILTERS = [
  ["All", "all"],
  ["Correct", "correct"],
  ["Review", "review"]
];

export default function Progress({ history, correct, filter, setFilter, reset }) {
  const { t } = useT();
  const rows = history.filter((h) => filter === "All" || (filter === "Correct" ? h.ok : !h.ok)).slice().reverse();
  const modules = MODULES.map((mod) => {
    const plays = history.filter((h) => safeSpot(h.hand).street === mod.id);
    return { id: mod.id, played: plays.length, score: pct(plays.filter((h) => h.ok).length, plays.length) };
  });
  const xp = history.reduce((s, h) => s + (h.points ?? (h.ok ? 80 : 15)), 0);

  return (
    <div className="page">
      <div className="page-title split">
        <div>
          <span className="tag">{t("progress.tag")}</span>
          <h1>{t("progress.title")}</h1>
          <p>{t("progress.blurb")}</p>
        </div>
        <button className="ghost" onClick={reset}>
          <RotateCcw /> {t("progress.reset")}
        </button>
      </div>
      <div className="metric-grid">
        <div>
          <small>{t("progress.hands")}</small>
          <b>{history.length}</b>
          <span>{t("progress.unique", { n: new Set(history.map((h) => h.hand)).size })}</span>
        </div>
        <div>
          <small>{t("progress.accuracy")}</small>
          <b>{pct(correct, history.length)}%</b>
          <span>{t("progress.matches", { n: correct })}</span>
        </div>
        <div>
          <small>{t("progress.xp")}</small>
          <b>{xp}</b>
          <span>{t("progress.xpMeta")}</span>
        </div>
      </div>
      <div className="chart-grid">
        <article className="accuracy-orbit">
          <div className="big-donut" style={{ background: `conic-gradient(var(--accent) 0 ${pct(correct, history.length)}%,var(--line) 0)` }}>
            <span>
              <b>{pct(correct, history.length)}%</b>
              {t("progress.accuracyWord")}
            </span>
          </div>
          <div>
            <small>{t("progress.pulse")}</small>
            <h2>{t("progress.quality")}</h2>
            <p>{history.length ? t("progress.filling") : t("progress.emptyPulse")}</p>
          </div>
        </article>
        <article className="module-chart">
          <small>{t("progress.mastery")}</small>
          {modules.map((m) => (
            <div className="mastery" key={m.id}>
              <label>
                <b>{t(`modules.${m.id}`)}</b>
                <span>{t("progress.played", { n: m.played, score: m.score })}</span>
              </label>
              <div>
                <i style={{ width: `${m.score}%` }} />
                <em style={{ left: `${m.score}%` }} />
              </div>
            </div>
          ))}
        </article>
        <article className="decision-map">
          <small>{t("progress.map")}</small>
          <div className="heatmap streets">
            {MODULES.map((mod) => {
              const plays = history.filter((h) => safeSpot(h.hand).street === mod.id);
              const score = pct(plays.filter((h) => h.ok).length, plays.length);
              return (
                <button
                  key={mod.id}
                  title={t(`modules.${mod.id}`)}
                  className={plays.length ? (score >= 70 ? "great" : score >= 40 ? "mid" : "low") : "empty"}
                >
                  {t(`modules.${mod.id}`)}
                  <span>{plays.length ? score + "%" : "—"}</span>
                </button>
              );
            })}
          </div>
          <p>{t("progress.mapNote", { n: SPOTS.length.toLocaleString() })}</p>
        </article>
      </div>
      <div className="journal">
        <div className="journal-head">
          <h2>{t("progress.recent")}</h2>
          <div>
            {FILTERS.map(([id, key]) => (
              <button key={id} className={filter === id ? "on" : ""} onClick={() => setFilter(id)}>
                {t(`progress.${key}`)}
              </button>
            ))}
          </div>
        </div>
        {rows.length ? (
          rows.map((h) => {
            const spot = safeSpot(h.hand);
            return (
              <div className="row" key={h.id}>
                <span className={h.ok ? "ok" : "no"}>{h.ok ? "✓" : "!"}</span>
                <div>
                  <b>{spot.spot}</b>
                  <small>
                    {spot.pos} · {spot.cards.join(" ")}
                  </small>
                </div>
                <span>
                  {t("progress.chose")} <b>{h.choice}</b>
                </span>
                <span>
                  <b>+{h.points ?? (h.ok ? 80 : 15)} XP</b>
                </span>
              </div>
            );
          })
        ) : (
          <div className="empty">
            <ChartNoAxesColumnIncreasing />
            <h3>{t("progress.noneTitle")}</h3>
            <p>{t("progress.noneBody")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
