"use client";

import { useState } from "react";
import { ChevronRight, GraduationCap, RotateCcw, Trophy, Zap } from "lucide-react";
import { DRILL_POOLS, MODULES, MODULE_TAGS, SOURCE, SPOTS, indicesFor, pct } from "@/lib/spots";
import { useT } from "@/lib/i18n";

// Training hub: pick a filter and a mode, or enter by street.
export default function Train({ start, answered, correct, reviewQueue }) {
  const { t } = useT();
  const [pool, setPool] = useState("all");

  return (
    <div className="page train">
      <div className="page-title">
        <span className="tag">{t("home.tag")}</span>
        <h1>
          {t("home.title1")} <em>{t("home.title2")}</em>
        </h1>
        <p>{t("home.blurb", { name: SOURCE.name, preflop: SOURCE.preflop, postflop: SOURCE.postflop })}</p>
      </div>

      <section className="mode-picker">
        <div className="mode-intro">
          <small>{t("home.choose")}</small>
          <h2>{t("home.how")}</h2>
          <p>{t("home.howBody")}</p>
        </div>
        <div className="pool-chips">
          <small>{t("home.pool")}</small>
          <div>
            {DRILL_POOLS.map((key) => (
              <button key={key} type="button" className={pool === key ? "on" : ""} onClick={() => setPool(key)}>
                {t(`pools.${key}`)}
                <em>{indicesFor(key).length.toLocaleString()}</em>
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => start(pool, "learn")}>
          <GraduationCap />
          <span>
            <b>{t("home.learn")}</b>
            <small>{t("home.learnHint")}</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => start(pool, "drill")}>
          <Zap />
          <span>
            <b>{t("home.drill")}</b>
            <small>{t("home.drillHint")}</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => start(pool, "challenge")}>
          <Trophy />
          <span>
            <b>{t("home.challenge")}</b>
            <small>{t("home.challengeHint")}</small>
          </span>
          <ChevronRight />
        </button>
        <button className="review-mode" disabled={!reviewQueue.length} onClick={() => start("all", "review", reviewQueue)}>
          <RotateCcw />
          <span>
            <b>{t("home.review")}</b>
            <small>{reviewQueue.length ? t("home.reviewReady", { n: reviewQueue.length }) : t("home.reviewEmpty")}</small>
          </span>
          <ChevronRight />
        </button>
      </section>

      <section className="quick">
        <div>
          <small>{t("home.accuracy")}</small>
          <strong>{pct(correct, answered)}%</strong>
          <div className="bar">
            <i style={{ width: `${pct(correct, answered)}%` }} />
          </div>
          <span>{answered ? t("home.accuracyBody", { correct, answered }) : t("home.accuracyEmpty")}</span>
        </div>
        <div>
          <small>{t("home.path")}</small>
          <b>{t("home.pathName")}</b>
          <span>{t("home.pathMeta", { preflop: SOURCE.preflop })}</span>
          <button onClick={() => start("preflop")}>
            {t("home.resume")} <ChevronRight />
          </button>
        </div>
        <div>
          <small>{t("home.today")}</small>
          <b>{t("home.todayName")}</b>
          <span>{t("home.todayMeta")}</span>
          <button onClick={() => start("bb-defend", "challenge")}>
            {t("home.start")} <ChevronRight />
          </button>
        </div>
      </section>

      <div className="section-title">
        <div>
          <small>{t("home.pathTitle")}</small>
          <h2>{t("home.pathSub")}</h2>
        </div>
        <span>{t("home.pathCount", { n: SPOTS.length.toLocaleString() })}</span>
      </div>
      <div className="course-list">
        {MODULES.map((mod, i) => (
          <article key={mod.id}>
            <span className="num">0{i + 1}</span>
            <div>
              <small>{t("learn.spots", { n: mod.count.toLocaleString() })}</small>
              <h2>{t(`modules.${mod.id}`)}</h2>
              <p>{t(`modules.${mod.id}Blurb`)}</p>
            </div>
            <div className="skill-tags">
              {(MODULE_TAGS[mod.id] || []).map((tag) => (
                <span key={tag}>{t(`modules.${tag}`)}</span>
              ))}
            </div>
            <button onClick={() => start(mod.id)}>
              {t("learn.start")} <ChevronRight />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
