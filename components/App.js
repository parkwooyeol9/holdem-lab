"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CircleQuestionMark,
  Flame,
  Gauge,
  GraduationCap,
  House,
  Microscope,
  Settings,
  Spade,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import { SPOTS } from "@/lib/spots";
import { FACES } from "@/lib/characters";
import Home from "./Home";
import Learn from "./Learn";
import Practice from "./Practice";
import HandLab from "./HandLab";
import Progress from "./Progress";
import Summary from "./Summary";
import Lounge from "./Lounge";
import Live from "./Live";

const NAV = [
  ["lounge", Users, "Lounge"],
  ["home", House, "Home"],
  ["learn", GraduationCap, "Learn"],
  ["practice", BrainCircuit, "Practice"],
  ["handlab", Microscope, "Hand Lab"],
  ["live", Gauge, "Live"],
  ["progress", ChartNoAxesColumnIncreasing, "Progress"]
];

export default function App() {
  const [page, setPage] = useState("lounge");
  const [hand, setHand] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [mode, setMode] = useState("learn");
  const [lives, setLives] = useState(3);
  const [sessionStart, setSessionStart] = useState(0);
  const [dealt, setDealt] = useState(0);
  const [reviewSet, setReviewSet] = useState(null);
  const [reviewCursor, setReviewCursor] = useState(0);
  const [nick, setNick] = useState("");
  const [nickDraft, setNickDraft] = useState("");
  const [face, setFace] = useState("😎");
  const [modal, setModal] = useState(null);
  const [nickReady, setNickReady] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const liveFocus = page === "live";

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem("hl-progress") || "[]"));
      setNick(localStorage.getItem("hl-nick") || "");
      setFace(localStorage.getItem("hl-face") || "😎");
    } catch {}
    setNickReady(true);
  }, []);
  useEffect(() => localStorage.setItem("hl-progress", JSON.stringify(history)), [history]);
  useEffect(() => {
    if (nick) localStorage.setItem("hl-nick", nick);
  }, [nick]);
  useEffect(() => {
    if (face) localStorage.setItem("hl-face", face);
  }, [face]);
  useEffect(() => {
    if (nickReady && !nick && page === "lounge") {
      setNickDraft("");
      setModal("nick");
    }
  }, [nickReady, nick, page]);
  useEffect(() => {
    setNavOpen(false);
  }, [page]);

  const item = SPOTS[hand];
  const correct = history.filter((h) => h.ok).length;
  const answered = history.length;
  const xp = history.reduce((s, h) => s + (h.points ?? (h.ok ? 80 : 15)), 0);
  const streak = Math.min(7, Math.max(1, new Set(history.map((h) => h.day)).size));
  const miss = [...history].reverse().findIndex((h) => !h.ok);
  const combo = miss < 0 ? history.length : miss;
  const reviewQueue = [...new Set(history.filter((h) => !h.ok || h.seconds > 15).map((h) => h.hand))];
  const sessionResults = history.slice(sessionStart);

  const start = (idx = 0, nextMode = "learn", queue = null) => {
    const q = queue?.length ? queue : null;
    setMode(nextMode);
    setReviewSet(q);
    setReviewCursor(0);
    setHand(q ? q[0] : idx);
    setAnswer(null);
    setLives(3);
    setSessionStart(history.length);
    setDealt(0);
    setPage("practice");
  };

  const saveNick = (value) => {
    const clean = String(value || "").trim().slice(0, 16);
    if (clean.length < 2) return;
    setNick(clean);
    setNickDraft("");
    setModal(null);
  };

  return (
    <div className={"app" + (liveFocus ? " live-focus" : "") + (navOpen ? " nav-open" : "")}>
      {liveFocus && navOpen && <div className="live-nav-scrim" onClick={() => setNavOpen(false)} />}
      <aside>
        <div className="logo">
          <span>
            <Spade />
          </span>
          <b>
            Holdem <em>Lab</em>
          </b>
        </div>
        <nav>
          {NAV.map(([id, Icon, label]) => (
            <button
              key={id}
              className={page === id ? "on" : ""}
              onClick={() => {
                setPage(id);
                setNavOpen(false);
              }}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button onClick={() => setModal("help")}>
            <CircleQuestionMark /> How it works
          </button>
          <button onClick={() => { setNickDraft(nick); setModal("settings"); }}>
            <Settings /> Settings
          </button>
          <div className="profile">
            <span className="profile-face">{face}</span>
            <div>
              <b>{nick || "Player"}</b>
              <small>
                Level {Math.floor(xp / 400) + 1} · {xp} XP
              </small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <button
            className="mobile-logo"
            onClick={() => {
              if (liveFocus) setNavOpen((open) => !open);
              else setPage("lounge");
            }}
          >
            <Spade />
          </button>
          <div className="crumb">
            HOLD’EM LAB <ChevronRight /> <b>{page.toUpperCase()}</b>
          </div>
          <div className="top-stats">
            <span>
              <Flame /> {streak} day streak
            </span>
            <span className={combo > 1 ? "combo-live" : ""}>
              <Zap /> ×{Math.max(1, combo)} combo
            </span>
            <span>
              <Trophy /> {xp} XP
            </span>
          </div>
        </header>
        {page === "home" && (
          <Home start={start} answered={answered} correct={correct} reviewQueue={reviewQueue} openLounge={() => setPage("lounge")} />
        )}
        {page === "learn" && <Learn start={start} />}
        {page === "practice" && (
          <Practice
            item={item}
            idx={hand}
            answer={answer}
            choose={(choice, seconds = 15) => {
              if (answer) return;
              setAnswer(choice);
              const frequency = item.mix[choice] || 0;
              const evLoss = Math.max(0, Math.max(...Object.values(item.ev).map(Number)) - Number(item.ev[choice]));
              const grade = choice === item.a ? "optimal" : frequency >= 25 || evLoss <= 0.25 ? "mixed" : "review";
              const ok = grade !== "review";
              const bonus = mode === "learn" ? 0 : 3 * Math.max(0, 15 - seconds) + 10 * Math.min(combo, 5);
              const points = (grade === "optimal" ? 80 : grade === "mixed" ? 55 : 15) + (ok ? bonus : 0);
              if (mode === "challenge" && !ok) setLives((n) => Math.max(0, n - 1));
              setDealt((n) => n + 1);
              setHistory((h) => [
                ...h,
                {
                  id: Date.now(),
                  hand,
                  choice,
                  ok,
                  grade,
                  frequency,
                  evLoss,
                  points,
                  seconds,
                  mode,
                  day: new Date().toDateString()
                }
              ]);
            }}
            next={() => {
              if (dealt >= 5 || (mode === "challenge" && lives <= 0)) {
                setAnswer(null);
                setPage("summary");
                return;
              }
              setAnswer(null);
              if (reviewSet?.length) {
                const n = (reviewCursor + 1) % reviewSet.length;
                setReviewCursor(n);
                setHand(reviewSet[n]);
              } else setHand((n) => (n + 1) % SPOTS.length);
            }}
            combo={combo}
            xp={xp}
            mode={mode}
            lives={lives}
          />
        )}
        {page === "handlab" && <HandLab />}
        {page === "live" && <Live />}
        {page === "progress" && (
          <Progress history={history} correct={correct} filter={filter} setFilter={setFilter} reset={() => { setHistory([]); setAnswer(null); }} />
        )}
        {page === "summary" && (
          <Summary results={sessionResults} mode={mode} start={start} reviewQueue={reviewQueue} goHome={() => setPage("home")} />
        )}
        {page === "lounge" && (
          <Lounge
            nickname={nick}
            face={face}
            onNeedNick={() => {
              setNickDraft(nick);
              setModal("nick");
            }}
          />
        )}
      </main>

      {modal && (
        <div className="modal-scrim" onClick={() => {
          if (modal === "nick" && !nick) return;
          setModal(null);
        }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {modal === "help" && (
              <>
                <small className="tag">HOW IT WORKS</small>
                <h2>A hangout with real Hold’em.</h2>
                <p>The Lounge is a party table: pick a character, sit down, and talk. Texas Hold’em keeps dealing in the background. Chips are play money only. Learn / Drill stay on Home if you want GTO training.</p>
                <button className="cta" onClick={() => setModal(null)}>
                  Got it
                </button>
              </>
            )}
            {(modal === "settings" || modal === "nick") && (
              <>
                <small className="tag">{modal === "nick" ? "TABLE NAME" : "SETTINGS"}</small>
                <h2>{modal === "nick" ? "Who’s showing up?" : "Your party identity"}</h2>
                <p>Pick an expressive face and a nickname. That’s the whole costume.</p>
                <form
                  className="nick-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveNick(nickDraft);
                    if (modal === "nick") setPage("lounge");
                  }}
                >
                  <div className="face-grid">
                    {FACES.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={face === f.emoji ? "on" : ""}
                        onClick={() => setFace(f.emoji)}
                        title={f.name}
                      >
                        {f.emoji}
                      </button>
                    ))}
                  </div>
                  <input
                    autoFocus
                    value={nickDraft}
                    onChange={(e) => setNickDraft(e.target.value)}
                    placeholder="e.g. riverkid"
                    maxLength={16}
                  />
                  <button className="cta" type="submit" disabled={nickDraft.trim().length < 2}>
                    Hop in
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
