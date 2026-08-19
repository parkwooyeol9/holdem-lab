"use client";

import { ChevronRight, GraduationCap, RotateCcw, Trophy, Zap } from "lucide-react";
import { MODULES, SPOTS, pct } from "@/lib/spots";

export default function Home({ start, answered, correct, reviewQueue, openLounge }) {
  return (
    <div className="page home">
      <section className="welcome">
        <div>
          <span className="tag">GTO, MADE PLAYABLE</span>
          <h1>
            Build poker instincts.
            <br />
            <em>One decision at a time.</em>
          </h1>
          <p>Interactive lessons turn solver strategy into clear, repeatable decisions. No charts to memorize. No jargon required.</p>
          <button className="cta" onClick={() => start(answered % SPOTS.length)}>
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
            {SPOTS.length}
            <small>TRAINING SPOTS</small>
          </b>
        </div>
      </section>

      <section className="mode-picker">
        <div className="mode-intro">
          <small>CHOOSE YOUR SESSION</small>
          <h2>How do you want to train?</h2>
          <p>Every session is five hands. Your results shape the next review queue.</p>
        </div>
        <button onClick={() => start(answered % SPOTS.length, "learn")}>
          <GraduationCap />
          <span>
            <b>Learn</b>
            <small>No pressure · full coaching</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => start(answered % SPOTS.length, "drill")}>
          <Zap />
          <span>
            <b>Drill</b>
            <small>Speed XP · combo scoring</small>
          </span>
          <ChevronRight />
        </button>
        <button onClick={() => start(0, "challenge")}>
          <Trophy />
          <span>
            <b>Challenge</b>
            <small>3 lives · five-hand score</small>
          </span>
          <ChevronRight />
        </button>
        <button className="review-mode" disabled={!reviewQueue.length} onClick={() => start(0, "review", reviewQueue)}>
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
          <span>{answered ? `${correct} of ${answered} decisions correct` : "Complete your first hand to begin"}</span>
        </div>
        <div>
          <small>CURRENT PATH</small>
          <b>Foundations</b>
          <span>{Math.min(answered, 3)} of 3 spots completed</span>
          <button onClick={() => start(0)}>
            Resume <ChevronRight />
          </button>
        </div>
        <div>
          <small>TODAY’S CHALLENGE</small>
          <b>Defend the Big Blind</b>
          <span>3 hands · about 4 minutes</span>
          <button onClick={() => start(0)}>
            Start challenge <ChevronRight />
          </button>
        </div>
      </section>

      <div className="section-title">
        <div>
          <small>YOUR LEARNING PATH</small>
          <h2>From first principles to river decisions.</h2>
        </div>
        <span>9 interactive spots</span>
      </div>
      <div className="module-grid">
        {MODULES.map((mod, i) => (
          <article key={mod[0]} className={i === 3 ? "locked" : ""}>
            <span>0{i + 1}</span>
            <div className="module-icon">{i === 0 ? "♠" : i === 1 ? "◇" : i === 2 ? "♜" : "◫"}</div>
            <small>{mod[1]} SPOTS</small>
            <h3>{mod[0]}</h3>
            <p>{mod[2]}</p>
            <button disabled={!mod[1]} onClick={() => start(3 * i)}>
              {mod[1] ? "Open module" : "Locked"} <ChevronRight />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
