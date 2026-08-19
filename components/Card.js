"use client";

import { prettyCard, isRed } from "@/lib/poker";

export default function Card({ c, mini }) {
  const code = typeof c === "string" && c.length >= 2 && c !== "xx" ? c : null;
  const label = code ? prettyCard(code) : c || "";
  const red = code ? isRed(code) : /[♥♦]/.test(label);
  const rank = code ? (code[0] === "T" ? "T" : code[0]) : label[0];
  const suit = code ? prettyCard(code).slice(1) : label.slice(1);
  return (
    <div className={"p-card " + (red ? "red" : "") + (mini ? " mini-face" : "")}>
      <b>{rank}</b>
      <span>{suit}</span>
    </div>
  );
}

export function FaceCard({ c }) {
  const red = /[♥♦]/.test(c);
  return (
    <div className={"p-card " + (red ? "red" : "")}>
      <b>{c[0]}</b>
      <span>{c.slice(1)}</span>
    </div>
  );
}
