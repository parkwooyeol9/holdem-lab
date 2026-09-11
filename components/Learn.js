"use client";

import { ChevronRight } from "lucide-react";
import { MODULES, SOURCE } from "@/lib/spots";

export default function Learn({ start }) {
  return (
    <div className="page">
      <div className="page-title">
        <span className="tag">CURRICULUM</span>
        <h1>Learn the game in layers.</h1>
        <p>
          Each module samples {SOURCE.name} nodes for that street. Preflop uses {SOURCE.preflop}; flop, turn and river use {SOURCE.postflop}.
        </p>
      </div>
      <div className="course-list">
        {MODULES.map((mod, i) => (
          <article key={mod.id}>
            <span className="num">0{i + 1}</span>
            <div>
              <small>{mod.count.toLocaleString()} INTERACTIVE SPOTS</small>
              <h2>{mod.name}</h2>
              <p>{mod.blurb}</p>
            </div>
            <div className="skill-tags">
              {mod.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <button onClick={() => start(mod.id)}>
              Start <ChevronRight />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
