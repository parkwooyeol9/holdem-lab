"use client";

import { ChevronRight } from "lucide-react";
import { DRILL_POOLS, MODULES, MODULE_TAGS, SOURCE, indicesFor } from "@/lib/spots";
import { useT } from "@/lib/i18n";

export default function Learn({ start }) {
  const { t } = useT();
  return (
    <div className="page">
      <div className="page-title">
        <span className="tag">{t("learn.tag")}</span>
        <h1>{t("learn.title")}</h1>
        <p>{t("learn.blurb", { name: SOURCE.name, preflop: SOURCE.preflop, postflop: SOURCE.postflop })}</p>
      </div>
      <div className="pool-chips learn-pools">
        <small>{t("home.pool")}</small>
        <div>
          {DRILL_POOLS.map((key) => (
            <button key={key} type="button" onClick={() => start(key, "learn")}>
              {t(`pools.${key}`)}
              <em>{indicesFor(key).length.toLocaleString()}</em>
            </button>
          ))}
        </div>
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
