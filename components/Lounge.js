"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Sparkles } from "lucide-react";
import { ACTION_SECONDS, BIG_BLIND, legalActions, SEAT_COUNT, SMALL_BLIND } from "@/lib/poker";
import { createRoom, DEFAULT_TABLE, makePlayer } from "@/lib/lounge";
import { CHAT_EMOJIS } from "@/lib/characters";
import Card from "./Card";

const QUICK = ["lmao", "wait wait", "I'm so bad", "deal me in", "brb", "who brought snacks", "we are so back", "just vibing"];
const STREET = { waiting: "Waiting", preflop: "Preflop", flop: "Flop", turn: "Turn", river: "River", showdown: "Showdown" };

function Avatar({ face, nick, hue, big }) {
  return (
    <span
      className={"seat-av" + (big ? " xl" : "")}
      style={{ background: `hsl(${hue || 280} 70% 22%)`, boxShadow: `0 0 0 3px hsl(${hue || 280} 90% 62%)` }}
      title={nick}
    >
      {face || "🙂"}
    </span>
  );
}

function HiddenCard() {
  return <div className="p-card hole-back" />;
}

function lastSpeech(chat, nick, now) {
  const line = [...(chat || [])].reverse().find((m) => m.from === nick && now - m.at < 7000);
  return line || null;
}

export default function Lounge({ nickname, face, onNeedNick }) {
  const [table, setTable] = useState(null);
  const [raiseTo, setRaiseTo] = useState("");
  const [draft, setDraft] = useState("");
  const [now, setNow] = useState(Date.now());
  const roomRef = useRef(null);
  const chatRef = useRef(null);
  const player = useMemo(() => (nickname ? makePlayer(nickname, face) : null), [nickname, face]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!player) return;
    const room = createRoom({ tableId: DEFAULT_TABLE, player, onTable: setTable });
    roomRef.current = room;
    return () => {
      room.destroy();
      roomRef.current = null;
      setTable(null);
    };
  }, [player]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [table?.chat?.length]);

  useEffect(() => {
    const next = table && player ? legalActions(table, player.id) : null;
    if (next?.can) setRaiseTo(String(next.minRaise));
  }, [table?.toAct, table?.currentBet, table?.street, player]);

  if (!nickname) {
    return (
      <div className="page lounge-page party">
        <div className="page-title">
          <span className="tag">PARTY TABLE</span>
          <h1>Come hang. Real Hold’em still deals.</h1>
          <p>Pick a character, sit with friends, and talk. Chips are play money. The hand is real Texas Hold’em.</p>
        </div>
        <button className="cta" onClick={onNeedNick}>
          Pick your character
        </button>
      </div>
    );
  }

  const mySeat = table?.seats.findIndex((s) => s?.id === player.id) ?? -1;
  const seated = mySeat >= 0;
  const acts = table && player ? legalActions(table, player.id) : { can: false };
  const toActNick = table?.toAct != null ? table.seats[table.toAct]?.nick : null;
  const remaining = table?.actionEndsAt ? Math.max(0, Math.ceil((table.actionEndsAt - now) / 1000)) : ACTION_SECONDS;
  const hanging = (table?.seats.filter(Boolean).length || 0) + (table?.spectators.length || 0);

  const visualOrder = seated
    ? [...Array(SEAT_COUNT)].map((_, i) => (mySeat + i) % SEAT_COUNT)
    : [...Array(SEAT_COUNT).keys()];

  return (
    <div className="page lounge-page party">
      <div className="lounge-top">
        <div>
          <span className="tag">PARTY TABLE · PLAY CHIPS · {SMALL_BLIND}/{BIG_BLIND}</span>
          <h1>Sit down. Talk. Keep playing real Hold’em.</h1>
          <p>
            {hanging} at the table · play money · {table?.handNo ? `hand #${table.handNo}` : "no hand yet"} · {STREET[table?.street] || "Waiting"}
            {toActNick ? ` · ${toActNick} to act` : ""}
            {table?.street && table.street !== "waiting" ? ` · ${remaining}s` : ""}
          </p>
        </div>
        <div className="lounge-top-actions">
          <button className="ghost" onClick={() => roomRef.current?.addBot()} disabled={(table?.seats.filter(Boolean).length || 0) >= SEAT_COUNT}>
            <Bot /> Invite a party bot
          </button>
          <button className="ghost" onClick={() => roomRef.current?.removeBot()} disabled={!table?.seats.some((s) => s?.bot)}>
            Uninvite bot
          </button>
          {seated && (
            <button className="ghost" onClick={() => roomRef.current?.leave()}>
              Leave seat
            </button>
          )}
        </div>
      </div>

      <div className="lounge-play">
        <div className="social-felt-wrap">
          <div className="social-felt">
            {visualOrder.map((seatIdx, visual) => {
              const p = table?.seats[seatIdx];
              const empty = !p;
              const isHero = visual === 0 && seated;
              const acting = table?.toAct === seatIdx;
              const speech = p ? lastSpeech(table?.chat, p.nick, now) : null;
              return (
                <div key={seatIdx} className={`seat seat-${visual} ${acting ? "acting" : ""} ${isHero ? "hero" : ""}`}>
                  {empty ? (
                    <div className="empty-seat-col">
                      {!seated && (
                        <button className="empty-seat" onClick={() => roomRef.current?.sit(seatIdx)}>
                          Sit with us
                        </button>
                      )}
                      <button className="empty-seat bot-seat" onClick={() => roomRef.current?.addBot(seatIdx)}>
                        + party bot
                      </button>
                    </div>
                  ) : (
                    <>
                      {speech && (
                        <div className={"speech " + (speech.emoji ? "emoji" : "")}>
                          {speech.emoji ? speech.text : speech.text}
                        </div>
                      )}
                      <div className="seat-cards">
                        {p.hole?.length
                          ? p.hole[0] === "xx"
                            ? p.folded
                              ? null
                              : (
                                <>
                                  <HiddenCard />
                                  <HiddenCard />
                                </>
                              )
                            : p.folded
                              ? null
                              : p.hole.map((c) => <Card key={c} c={c} />)
                          : null}
                      </div>
                      <div className="seat-chip">
                        <Avatar face={p.face} nick={p.nick} hue={p.hue} big />
                        <div>
                          <b>
                            {p.nick}
                            {p.bot ? <i className="bot-tag">BOT</i> : null}
                          </b>
                          <small>
                            {p.stack}
                            {table?.button === seatIdx ? " · BTN" : ""}
                            {p.lastAction ? ` · ${p.lastAction}` : ""}
                          </small>
                        </div>
                        {p.bet > 0 && <em className="bet-pip">✦ {p.bet}</em>}
                        {(table?.floaters || [])
                          .filter((f) => f.playerId === p.id && now - f.at < 2200)
                          .map((f) => (
                            <span key={f.id} className="emoji-float">
                              {f.emoji}
                            </span>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <div className="felt-center">
              {table?.street && table.street !== "waiting" && (
                <div className="street-pip">
                  {STREET[table.street]} · {SMALL_BLIND}/{BIG_BLIND}
                  {table.currentBet ? ` · bet ${table.currentBet}` : ""}
                </div>
              )}
              <div className="board">
                {(table?.board || []).map((c) => (
                  <Card key={c} c={c} />
                ))}
              </div>
              <div className="pot">
                POT <b>{table?.pot || 0}</b>
              </div>
              {table?.street === "showdown" && table?.winners && (
                <div className="table-burst win social-burst">
                  🎉 {table.winners.map((w) => `${w.nick} +${w.amount}${w.name && w.name !== "uncontested" ? ` · ${w.name}` : ""}`).join(" & ")}
                </div>
              )}
              {table?.street === "waiting" && (
                <div className="felt-wait">
                  <Sparkles />
                  <span>{seated ? "Need two stacks — invite a friend or drop in a bot" : "Grab a seat. Hold’em starts at two players."}</span>
                </div>
              )}
            </div>
          </div>

          <div className="reaction-dock">
            {CHAT_EMOJIS.map((q) => (
              <button key={q} type="button" onClick={() => roomRef.current?.say(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="social-actions">
            {acts.can ? (
              <>
                <button onClick={() => roomRef.current?.play("fold")}>Fold</button>
                {acts.canCheck ? (
                  <button className="cta" onClick={() => roomRef.current?.play("check")}>
                    Check
                  </button>
                ) : (
                  <button className="cta" onClick={() => roomRef.current?.play("call")}>
                    {acts.toCall >= (table?.seats[mySeat]?.stack || 0) ? `All-in ${table.seats[mySeat].stack}` : `Call ${acts.toCall}`}
                  </button>
                )}
                {acts.canRaise && (
                  <>
                    <input
                      className="raise-in"
                      type="number"
                      min={acts.minRaise}
                      max={acts.maxRaise}
                      value={raiseTo}
                      onChange={(e) => setRaiseTo(e.target.value)}
                    />
                    <button
                      className="party-raise"
                      onClick={() => roomRef.current?.play("raise", Number(raiseTo) || acts.minRaise)}
                    >
                      Raise to {raiseTo || acts.minRaise}
                    </button>
                  </>
                )}
                <small>auto-acts in {remaining}s if you keep chatting</small>
              </>
            ) : seated ? (
              table?.street === "showdown" ? (
                <button className="cta" onClick={() => roomRef.current?.dealNext()}>
                  Next hand
                </button>
              ) : (
                <p>{toActNick ? `${toActNick} to act · ${remaining}s` : "Hand in progress — next street deals automatically."}</p>
              )
            ) : (
              <p>Sit anywhere. Real Hold’em starts as soon as two seats are filled.</p>
            )}
          </div>
        </div>

        <aside className="table-chat">
          <div className="form-head">
            <MessageCircle />
            <div>
              <b>Live table chat</b>
              <small>{hanging} in the room · chat while the hand runs</small>
            </div>
          </div>
          <div className="chat-log" ref={chatRef}>
            {(table?.chat || []).map((m) => (
              <p key={m.id} className={m.from === "system" ? "sys" : m.emoji ? "chat-emoji" : "bubble"}>
                {m.from !== "system" && (
                  <b>
                    <span className="chat-face">{m.face || "🙂"}</span> {m.from}
                  </b>
                )}
                <span>{m.text}</span>
              </p>
            ))}
          </div>
          <div className="quick-chat">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => roomRef.current?.say(q)}>
                {q}
              </button>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              roomRef.current?.say(draft);
              setDraft("");
            }}
          >
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Say it to the table…" maxLength={140} />
            <button className="cta" type="submit">
              Send
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
