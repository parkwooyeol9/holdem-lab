"use client";

import { ChevronRight } from "lucide-react";
import { MODULES } from "@/lib/spots";

const TAGS = [
  ["Position", "Opening ranges", "3-bets"],
  ["Board texture", "C-bets", "Draws"],
  ["Barrels", "Blockers", "Sizing"],
  ["Range construction"]
];

export default function Learn({ start }) {
  return (
    <div className="page">
      <div className="page-title">
        <span className="tag">CURRICULUM</span>
        <h1>Learn the game in layers.</h1>
        <p>Each module introduces one idea, then tests it in realistic decisions.</p>
      </div>
      <div className="course-list">
        {MODULES.map((mod, i) => (
          <article key={mod[0]}>
            <span className="num">0{i + 1}</span>
            <div>
              <small>{mod[1] ? `${mod[1]} INTERACTIVE SPOTS` : "IN DEVELOPMENT"}</small>
              <h2>{mod[0]}</h2>
              <p>{mod[2]}</p>
            </div>
            <div className="skill-tags">
              {TAGS[i].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <button disabled={!mod[1]} onClick={() => start(3 * i)}>
              {mod[1] ? "Start" : "Soon"} <ChevronRight />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
