"use client";

import { ChevronRight, GraduationCap, RotateCcw, Trophy, Zap } from "lucide-react";
import { MODULES, SOURCE, SPOTS, pct } from "@/lib/spots";

export default function Home({ start, answered, correct, reviewQueue, openLounge }) {
  return (
    <div className="page home">
      <section className="welcome">
        <div>
          <span className="tag">POKERBENCH · 6-MAX GTO</span>
          <h1>
            Build poker instincts.
            <br />
            <em>One decision at a time.</em>
          </h1>
          <p>
            Drill real solver nodes from {SOURCE.name}: {SOURCE.preflop} preflop and {SOURCE.postflop} postflop, 100bb cash. Labels are the
            highest-frequency GTO action, not a mixed-strategy dump.
          </p>
          <button className="cta" onClick={() => start("all")}>
            Continue training <ChevronRight />
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
            <small>TRAINING SPOTS</small>
          </b>
        </div>
      </section>

      <section className="mode-picker">
        <div className="mode-intro">
          <small>CHOOSE YOUR SESSION</small>
          <h2>How do you want to train?</h2>
          <p>Every session is five random PokerBench hands. Misses go to your review queue.</p>
        </div>
        <button onClick={() => start("all", "learn")}>
          <GraduationCap />
          <span>
            <b>Learn</b>
            <small>No pressure · full line review</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => start("all", "drill")}>
          <Zap />
          <span>
            <b>Drill</b>
            <small>Speed XP · combo scoring</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => start("all", "challenge")}>
          <Trophy />
          <span>
            <b>Challenge</b>
            <small>3 lives · five-hand score</small>
          </span>
          <ChevronRight />
        </button>
        <button className="review-mode" disabled={!reviewQueue.length} onClick={() => start("all", "review", reviewQueue)}>
          <RotateCcw />
          <span>
            <b>Smart Review</b>
            <small>{reviewQueue.length ? `${reviewQueue.length} weak or slow spots ready` : "Complete hands to build your queue"}</small>
          </span>
          <ChevronRight />
        </button>
      </section>

      <button className="lounge-banner" onClick={openLounge}>
        <div>
          <small>PARTY TABLE</small>
          <b>Sit with friends. Real Hold’em keeps dealing.</b>
          <span>Live chat, emoji reactions, big characters — and a live 9-max table. Play chips only.</span>
        </div>
        <em>Join the lounge</em>
      </button>

      <section className="quick">
        <div>
          <small>OVERALL ACCURACY</small>
          <strong>{pct(correct, answered)}%</strong>
          <div className="bar">
            <i style={{ width: `${pct(correct, answered)}%` }} />
          </div>
          <span>{answered ? `${correct} of ${answered} decisions matched the solver` : "Complete your first hand to begin"}</span>
        </div>
        <div>
          <small>CURRENT PATH</small>
          <b>Preflop</b>
          <span>{SOURCE.preflop} · 6-max 100bb</span>
          <button onClick={() => start("preflop")}>
            Resume <ChevronRight />
          </button>
        </div>
        <div>
          <small>TODAY’S CHALLENGE</small>
          <b>Defend the Big Blind</b>
          <span>5 random BB spots</span>
          <button onClick={() => start("bb", "challenge")}>
            Start challenge <ChevronRight />
          </button>
        </div>
      </section>

      <div className="section-title">
        <div>
          <small>YOUR LEARNING PATH</small>
          <h2>From first-in opens to river decisions.</h2>
        </div>
        <span>{SPOTS.length.toLocaleString()} PokerBench spots</span>
      </div>
      <div className="module-grid">
        {MODULES.map((mod, i) => (
          <article key={mod.id}>
            <span>0{i + 1}</span>
            <div className="module-icon">{i === 0 ? "♠" : i === 1 ? "◇" : i === 2 ? "♜" : "▲"}</div>
            <small>{mod.count.toLocaleString()} SPOTS</small>
            <h3>{mod.name}</h3>
            <p>{mod.blurb}</p>
            <button onClick={() => start(mod.id)}>
              Open module <ChevronRight />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
