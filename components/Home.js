"use client";

import { useState } from "react";
import { ChevronRight, GraduationCap, RotateCcw, Trophy, Zap } from "lucide-react";
import { DRILL_POOLS, MODULES, SOURCE, SPOTS, indicesFor, pct } from "@/lib/spots";
import { useT } from "@/lib/i18n";

export default function Home({ start, answered, correct, reviewQueue, openLounge }) {
  const { t } = useT();
  const [pool, setPool] = useState("all");

  return (
    <div className="page home">
      <section className="welcome">
        <div>
          <span className="tag">{t("home.tag")}</span>
          <h1>
            {t("home.title1")}
            <br />
            <em>{t("home.title2")}</em>
          </h1>
          <p>
            {t("home.blurb", { name: SOURCE.name, preflop: SOURCE.preflop, postflop: SOURCE.postflop })}
          </p>
          <button className="cta" onClick={() => start(pool)}>
            {t("home.cta")} <ChevronRight />
          </button>
        </div>
        <div className="orbit">
          <div className="card-mini c1">
            A<span>♠</span>
          </div>
          <div className="brain">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
              <path d="M9 13a4.5 4.5 0 0 0 3-4" />
              <path d="M12 13h4" />
              <path d="M12 18h6a2 2 0 0 1 2 2v1" />
              <path d="M12 8h8" />
            </svg>
          </div>
          <div className="card-mini c2 red">
            K<span>♥</span>
          </div>
          <i />
          <b>
            {SPOTS.length.toLocaleString()}
            <small>{t("home.spots")}</small>
          </b>
        </div>
      </section>

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

      <button className="lounge-banner" onClick={openLounge}>
        <div>
          <small>{t("home.loungeTag")}</small>
          <b>{t("home.loungeTitle")}</b>
          <span>{t("home.loungeBody")}</span>
        </div>
        <em>{t("home.loungeCta")}</em>
      </button>

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
      <div className="module-grid">
        {MODULES.map((mod, i) => (
          <article key={mod.id}>
            <span>0{i + 1}</span>
            <div className="module-icon">{i === 0 ? "♠" : i === 1 ? "◇" : i === 2 ? "♜" : "▲"}</div>
            <small>
              {mod.count.toLocaleString()} {t("home.spotsLabel")}
            </small>
            <h3>{t(`modules.${mod.id}`)}</h3>
            <p>{t(`modules.${mod.id}Blurb`)}</p>
            <button onClick={() => start(mod.id)}>
              {t("home.openModule")} <ChevronRight />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
