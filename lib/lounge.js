import {
  act,
  addBot,
  autoAct,
  chat,
  emptyTable,
  maybeStartHand,
  nextHand,
  playBot,
  playerView,
  removeBot,
  sitDown,
  standUp,
  watchTable
} from "./poker";
import { PARTY_LINES } from "./characters";

export const TABLES = [{ id: "lounge", name: "Party Table", vibe: "Sit, chat, play real Hold’em", blinds: "5/10" }];
export const DEFAULT_TABLE = TABLES[0].id;

const CHANNEL = (id) => `holdem-lab-lounge-${id}`;
const HOST_PEER = (id) => `hlchi${id}v6`;

function apply(table, msg, selfId) {
  if (!msg || msg.from === selfId) return table;
  if (msg.type === "state" && msg.table && msg.table.updatedAt >= (table.updatedAt || 0)) {
    return msg.table;
  }
  return table;
}

export function createRoom({ tableId, player, onTable }) {
  const meta = TABLES.find((t) => t.id === tableId) || TABLES[0];
  let table = emptyTable(meta);
  let peer = null;
  let hostConn = null;
  const clients = new Map();
  let role = "solo";
  let destroyed = false;
  let channel = null;
  const timers = [];
  let lastRemote = Date.now();

  const emit = () => {
    if (!destroyed) onTable(playerView(structuredClone(table), player.id));
  };

  const broadcast = () => {
    table.hostId = player.id;
    table.updatedAt = Date.now();
    const payload = { type: "state", from: player.id, table };
    channel?.postMessage(payload);
    for (const conn of clients.values()) {
      try {
        conn.send(payload);
      } catch {}
    }
    emit();
  };

  const becomeHost = () => {
    role = "host";
    table.hostId = player.id;
    watchTable(table, player);
    maybeStartHand(table);
    broadcast();
  };

  const runHost = (fn) => {
    const cmd = { ...fn, type: "cmd", player };
    if (role === "client") {
      channel?.postMessage(cmd);
      try {
        hostConn?.send(cmd);
      } catch {}
      return;
    }
    const result = fn.op === "sit" ? sitDown(table, player, fn.seat)
      : fn.op === "leave" ? standUp(table, player.id)
      : fn.op === "chat" ? (chat(table, player, fn.text), { ok: true })
      : fn.op === "act" ? act(table, player.id, fn.action, fn.raiseTo)
      : fn.op === "next" ? (nextHand(table), { ok: true })
      : fn.op === "addBot" ? addBot(table, fn.seat)
      : fn.op === "removeBot" ? removeBot(table, fn.seat)
      : { error: "Unknown" };
    if (result?.error) return result;
    broadcast();
    return result;
  };

  const handleCommand = (msg) => {
    if (role !== "host") return;
    const who = msg.player;
    if (!who) return;
    if (msg.op === "hello") {
      watchTable(table, who);
      broadcast();
      return;
    }
    if (msg.op === "sit") sitDown(table, who, msg.seat);
    if (msg.op === "leave") standUp(table, who.id);
    if (msg.op === "chat") chat(table, who, msg.text);
    if (msg.op === "act") act(table, who.id, msg.action, msg.raiseTo);
    if (msg.op === "next") nextHand(table);
    if (msg.op === "addBot") addBot(table, msg.seat);
    if (msg.op === "removeBot") removeBot(table, msg.seat);
    broadcast();
  };

  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL(tableId));
    channel.onmessage = (ev) => {
      const msg = ev.data;
      if (msg?.type === "state" && msg.from !== player.id) {
        role = "client";
        lastRemote = Date.now();
        table = apply(table, msg, player.id);
        emit();
      } else if (msg?.type === "cmd" && role === "host") {
        handleCommand(msg);
      } else if (msg?.type === "who-is-host" && role === "host") {
        broadcast();
      }
    };
    channel.postMessage({ type: "who-is-host", from: player.id });
  }

  let botThinkUntil = 0;
  let lastBotChat = 0;
  timers.push(
    setInterval(() => {
      if (role === "client") {
        if (Date.now() - lastRemote > 4500) becomeHost();
        return;
      }
      const actor = table.toAct != null ? table.seats[table.toAct] : null;
      if (actor?.bot && table.street !== "waiting" && table.street !== "showdown") {
        if (!botThinkUntil) botThinkUntil = Date.now() + 400 + Math.floor(Math.random() * 700);
        if (Date.now() >= botThinkUntil) {
          playBot(table, actor);
          botThinkUntil = 0;
        }
      } else {
        botThinkUntil = 0;
        autoAct(table);
      }
      if (table.street === "waiting") maybeStartHand(table);
      if (table.street === "showdown" && table.showdownAt && Date.now() - table.showdownAt > 2200) {
        nextHand(table);
      }
      if (Date.now() - lastBotChat > 8000 && Math.random() < 0.22) {
        const bots = table.seats.filter((s) => s?.bot);
        if (bots.length) {
          const bot = bots[Math.floor(Math.random() * bots.length)];
          chat(table, bot, PARTY_LINES[Math.floor(Math.random() * PARTY_LINES.length)]);
          lastBotChat = Date.now();
        }
      }
      broadcast();
    }, 400)
  );

  const connectPeer = async () => {
    if (typeof window === "undefined") return;
    const { default: Peer } = await import("peerjs");
    const tryHost = () =>
      new Promise((resolve) => {
        const p = new Peer(HOST_PEER(tableId), { debug: 0 });
        const fail = () => {
          try {
            p.destroy();
          } catch {}
          resolve(null);
        };
        p.on("error", fail);
        p.on("open", () => resolve(p));
        setTimeout(fail, 2500);
      });

    const hostPeer = await tryHost();
    if (destroyed) {
      hostPeer?.destroy();
      return;
    }

    if (hostPeer) {
      peer = hostPeer;
      becomeHost();
      hostPeer.on("connection", (conn) => {
        conn.on("open", () => {
          clients.set(conn.peer, conn);
          conn.send({ type: "state", from: player.id, table });
        });
        conn.on("data", (msg) => {
          if (msg?.type === "cmd") handleCommand(msg);
        });
        conn.on("close", () => clients.delete(conn.peer));
      });
      return;
    }

    const guest = new Peer({ debug: 0 });
    peer = guest;
    await new Promise((resolve) => {
      guest.on("open", resolve);
      guest.on("error", resolve);
      setTimeout(resolve, 2500);
    });
    if (destroyed) {
      guest.destroy();
      return;
    }

    const conn = guest.connect(HOST_PEER(tableId), { reliable: true });
    hostConn = conn;
    conn.on("open", () => {
      conn.send({ type: "cmd", op: "hello", player });
    });
    conn.on("data", (msg) => {
      if (msg?.type === "state") {
        role = "client";
        lastRemote = Date.now();
        table = apply(table, msg, player.id);
        emit();
      }
    });
    conn.on("close", () => {
      hostConn = null;
      if (!destroyed) connectPeer();
    });
    conn.on("error", () => {
      if (!destroyed && role !== "host") setTimeout(connectPeer, 800);
    });

    setTimeout(() => {
      if (role === "solo" && !destroyed) becomeHost();
    }, 1600);
  };

  watchTable(table, player);
  emit();
  setTimeout(() => {
    if (role === "solo" && !destroyed) becomeHost();
  }, 300);
  connectPeer();

  return {
    sit: (seat) => runHost({ type: "cmd", op: "sit", player, seat }),
    leave: () => runHost({ type: "cmd", op: "leave", player }),
    say: (text) => runHost({ type: "cmd", op: "chat", player, text }),
    play: (action, raiseTo) => runHost({ type: "cmd", op: "act", player, action, raiseTo }),
    dealNext: () => runHost({ type: "cmd", op: "next", player }),
    addBot: (seat) => runHost({ type: "cmd", op: "addBot", player, seat }),
    removeBot: (seat) => runHost({ type: "cmd", op: "removeBot", player, seat }),
    destroy: () => {
      destroyed = true;
      timers.forEach(clearInterval);
      try {
        runHost({ type: "cmd", op: "leave", player });
      } catch {}
      channel?.close();
      try {
        peer?.destroy();
      } catch {}
    }
  };
}

export function hueFor(nick) {
  let h = 0;
  for (const ch of nick) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

export function makePlayer(nick, face) {
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem("hl-player-id") : null;
  const id = saved || (crypto.randomUUID?.() ?? `p-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const savedFace = typeof localStorage !== "undefined" ? localStorage.getItem("hl-face") : null;
  if (typeof localStorage !== "undefined") localStorage.setItem("hl-player-id", id);
  return { id, nick, hue: hueFor(nick), face: face || savedFace || "😎" };
}
