"use client";

import { ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { pct, safeSpot } from "@/lib/spots";
import { useT } from "@/lib/i18n";

export default function Summary({ results, mode, start, reviewQueue, goHome }) {
  const { t } = useT();
  const good = results.filter((r) => r.ok).length;
  const xp = results.reduce((s, r) => s + (r.points || 0), 0);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + (r.seconds || 0), 0) / results.length) : 0;
  const exact = results.filter((r) => r.grade === "optimal").length;
  const streetScores = {};
  for (const r of results) {
    const street = safeSpot(r.hand).street;
    if (!streetScores[street]) streetScores[street] = { ok: 0, n: 0 };
    streetScores[street].n += 1;
    if (r.ok) streetScores[street].ok += 1;
  }
  const strongestId = Object.entries(streetScores).sort((a, b) => b[1].ok / b[1].n - a[1].ok / a[1].n)[0]?.[0];
  const strongest = strongestId ? t(`modules.${strongestId}`) : "—";
  const headline = good >= 4 ? t("summary.sharp") : good >= 2 ? t("summary.ok") : t("summary.miss");

  return (
    <div className="page summary-page">
      <div className="summary-hero">
        <div className="summary-trophy">
          <Trophy />
        </div>
        <span className="tag">{t("summary.tag", { mode: t(`modes.${mode}`) })}</span>
        <h1>{headline}</h1>
        <p>{t("summary.added")}</p>
        <div className="session-score">
          <b>{xp}</b>
          <small>{t("summary.xp")}</small>
        </div>
      </div>
      <div className="summary-stats">
        <article>
          <small>{t("summary.quality")}</small>
          <b>{pct(good, results.length)}%</b>
          <span>{t("summary.matches", { good, total: results.length })}</span>
        </article>
        <article>
          <small>{t("summary.avg")}</small>
          <b>{avg}s</b>
          <span>{t("summary.per")}</span>
        </article>
        <article>
          <small>{t("summary.exact")}</small>
          <b>{exact}</b>
          <span>{t("summary.exactMeta")}</span>
        </article>
        <article>
          <small>{t("summary.strong")}</small>
          <b className="text-stat">{strongest}</b>
          <span>{t("summary.strongMeta")}</span>
        </article>
      </div>
      <div className="summary-breakdown">
        <div className="summary-head">
          <div>
            <small>{t("summary.replay")}</small>
            <h2>{t("summary.five")}</h2>
          </div>
          <span>{t("summary.legend")}</span>
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
                  {spot.cards.join(" ")} · {t("summary.chose", { choice: r.choice })}
                </small>
              </div>
              <span>{t(`grades.${grade}`)}</span>
              <span>{t("summary.solver", { action: spot.a })}</span>
              <b>+{r.points || 0} XP</b>
            </div>
          );
        })}
      </div>
      <div className="summary-actions">
        <button className="ghost" onClick={goHome}>
          {t("summary.home")}
        </button>
        <button className="ghost" disabled={!reviewQueue.length} onClick={() => start("all", "review", reviewQueue)}>
          <RotateCcw /> {t("summary.review")}
        </button>
        <button className="cta" onClick={() => start("all", mode)}>
          {t("summary.again")} <ChevronRight />
        </button>
      </div>
    </div>
  );
}
