"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { SPOTS, gradeChoice, indicesFor, sampleIndices, safeSpot } from "@/lib/spots";
import { FACES } from "@/lib/characters";
import { pageFromPath, pathFromPage } from "@/lib/routes";
import { useT } from "@/lib/i18n";
import Home from "./Home";
import Learn from "./Learn";
import Practice from "./Practice";
import HandLab from "./HandLab";
import Progress from "./Progress";
import Summary from "./Summary";
import Lounge from "./Lounge";
import Live from "./Live";

const NAV = [
  ["home", House],
  ["learn", GraduationCap],
  ["practice", BrainCircuit],
  ["handlab", Microscope],
  ["live", Gauge],
  ["progress", ChartNoAxesColumnIncreasing],
  ["lounge", Users]
];

export default function App() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = pageFromPath(pathname);
  const { t, lang, setLang } = useT();
  const [hand, setHand] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [mode, setMode] = useState("learn");
  const [pool, setPool] = useState("all");
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

  const go = (id, query) => {
    router.push(pathFromPage(id, query));
    setNavOpen(false);
  };

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem("hl-progress-v2") || "[]"));
      setNick(localStorage.getItem("hl-nick") || "");
      setFace(localStorage.getItem("hl-face") || "😎");
    } catch {}
    setNickReady(true);
  }, []);
  useEffect(() => localStorage.setItem("hl-progress-v2", JSON.stringify(history)), [history]);
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

  const item = safeSpot(hand);
  const sessionLen = reviewSet?.length || 5;
  const sessionNum = reviewCursor + 1;
  const correct = history.filter((h) => h.ok).length;
  const answered = history.length;
  const xp = history.reduce((s, h) => s + (h.points ?? (h.ok ? 80 : 15)), 0);
  const streak = Math.min(7, Math.max(1, new Set(history.map((h) => h.day)).size));
  const miss = [...history].reverse().findIndex((h) => !h.ok);
  const combo = miss < 0 ? history.length : miss;
  const reviewQueue = [...new Set(history.filter((h) => !h.ok || h.seconds > 15).map((h) => h.hand))];
  const sessionResults = history.slice(sessionStart);

  const begin = (poolKey = "all", nextMode = "learn", queue = null) => {
    const q = queue?.length ? queue : sampleIndices(indicesFor(poolKey), 5);
    setPool(poolKey);
    setMode(nextMode);
    setReviewSet(q);
    setReviewCursor(0);
    setHand(q[0] ?? 0);
    setAnswer(null);
    setLives(3);
    setSessionStart(history.length);
    setDealt(0);
  };

  const start = (poolKey = "all", nextMode = "learn", queue = null) => {
    begin(poolKey, nextMode, queue);
    go("practice", { pool: poolKey, mode: nextMode });
  };

  useLayoutEffect(() => {
    if (page !== "practice") return;
    if (reviewSet) return;
    const nextPool = searchParams.get("pool") || "all";
    const nextMode = searchParams.get("mode") || "drill";
    begin(nextPool, nextMode);
  }, [page, reviewSet, searchParams]);

  const saveNick = (value) => {
    const clean = String(value || "").trim().slice(0, 16);
    if (clean.length < 2) return;
    setNick(clean);
    setNickDraft("");
    setModal(null);
  };

  const crumb = t(`nav.${page === "practice" ? "practice" : page}`) || page;

  return (
    <div className={"app" + (liveFocus ? " live-focus" : "") + (navOpen ? " nav-open" : "")}>
      {liveFocus && navOpen && <div className="live-nav-scrim" onClick={() => setNavOpen(false)} />}
      <aside>
        <div className="logo" onClick={() => go("home")}>
          <span>
            <Spade />
          </span>
          <b>
            Holdem <em>Lab</em>
          </b>
        </div>
        <nav>
          {NAV.map(([id, Icon]) => (
            <button
              key={id}
              className={page === id ? "on" : ""}
              onClick={() => {
                if (id === "practice") start(pool || "all", mode === "learn" ? "drill" : mode);
                else go(id);
              }}
            >
              <Icon /> {t(`nav.${id}`)}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button onClick={() => setModal("help")}>
            <CircleQuestionMark /> {t("chrome.how")}
          </button>
          <button
            onClick={() => {
              setNickDraft(nick);
              setModal("settings");
            }}
          >
            <Settings /> {t("chrome.settings")}
          </button>
          <div className="profile">
            <span className="profile-face">{face}</span>
            <div>
              <b>{nick || t("chrome.player")}</b>
              <small>{t("chrome.level", { n: Math.floor(xp / 400) + 1 })} · {xp} XP</small>
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
              else go("home");
            }}
          >
            <Spade />
          </button>
          <div className="crumb">
            {t("chrome.crumb")} <ChevronRight /> <b>{crumb}</b>
          </div>
          <div className="top-stats">
            <span>
              <Flame /> {t("chrome.streak", { n: streak })}
            </span>
            <span className={combo > 1 ? "combo-live" : ""}>
              <Zap /> {t("chrome.combo", { n: Math.max(1, combo) })}
            </span>
            <span>
              <Trophy /> {xp} XP
            </span>
          </div>
        </header>
        {page === "home" && (
          <Home start={start} answered={answered} correct={correct} reviewQueue={reviewQueue} openLounge={() => go("lounge")} />
        )}
        {page === "learn" && <Learn start={start} />}
        {page === "practice" && reviewSet?.length ? (
          <Practice
            item={item}
            idx={hand}
            session={Math.min(sessionNum, sessionLen)}
            total={sessionLen}
            answer={answer}
            choose={(choice, seconds = 15) => {
              if (answer) return;
              setAnswer(choice);
              const { grade, ok, frequency, evLoss } = gradeChoice(item, choice);
              const bonus = mode === "learn" ? 0 : 3 * Math.max(0, 15 - seconds) + 10 * Math.min(combo, 5);
              const points = (grade === "optimal" ? 80 : grade === "close" ? 55 : 15) + (ok ? bonus : 0);
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
              if (dealt >= sessionLen || (mode === "challenge" && lives <= 0)) {
                setAnswer(null);
                go("summary");
                return;
              }
              setAnswer(null);
              if (reviewSet?.length) {
                const n = reviewCursor + 1;
                if (n >= reviewSet.length) {
                  go("summary");
                  return;
                }
                setReviewCursor(n);
                setHand(reviewSet[n]);
              } else setHand((n) => (n + 1) % SPOTS.length);
            }}
            combo={combo}
            xp={xp}
            mode={mode}
            lives={lives}
          />
        ) : null}
        {page === "handlab" && <HandLab />}
        {page === "live" && <Live />}
        {page === "progress" && (
          <Progress history={history} correct={correct} filter={filter} setFilter={setFilter} reset={() => { setHistory([]); setAnswer(null); }} />
        )}
        {page === "summary" && (
          <Summary results={sessionResults} mode={mode} start={start} reviewQueue={reviewQueue} goHome={() => go("home")} />
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
        <div
          className="modal-scrim"
          onClick={() => {
            if (modal === "nick" && !nick) return;
            setModal(null);
          }}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {modal === "help" && (
              <>
                <small className="tag">{t("help.tag")}</small>
                <h2>{t("help.title")}</h2>
                <p>{t("help.body")}</p>
                <button className="cta" onClick={() => setModal(null)}>
                  {t("help.gotIt")}
                </button>
              </>
            )}
            {(modal === "settings" || modal === "nick") && (
              <>
                <small className="tag">{modal === "nick" ? t("settings.nickTag") : t("settings.tag")}</small>
                <h2>{modal === "nick" ? t("settings.nickTitle") : t("settings.title")}</h2>
                <p>{modal === "nick" ? t("settings.nickLead") : t("settings.lead")}</p>
                {modal === "settings" ? (
                  <div className="lang-toggle">
                    <small>{t("settings.language")}</small>
                    <div>
                      <button type="button" className={lang === "ko" ? "on" : ""} onClick={() => setLang("ko")}>
                        {t("settings.ko")}
                      </button>
                      <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
                        {t("settings.en")}
                      </button>
                    </div>
                  </div>
                ) : null}
                <form
                  className="nick-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (modal === "nick") {
                      saveNick(nickDraft);
                      go("lounge");
                    } else if (nickDraft.trim().length >= 2) saveNick(nickDraft);
                    else setModal(null);
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
                    autoFocus={modal === "nick"}
                    value={nickDraft}
                    onChange={(e) => setNickDraft(e.target.value)}
                    placeholder={t("settings.placeholder")}
                    maxLength={16}
                  />
                  <button className="cta" type="submit" disabled={modal === "nick" && nickDraft.trim().length < 2}>
                    {modal === "nick" ? t("settings.hopIn") : t("settings.save")}
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
