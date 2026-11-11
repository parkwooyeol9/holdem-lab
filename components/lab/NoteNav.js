"use client";

export const NOTES = [
  ["home", "연구 홈"],
  ["tournament", "스택과 3벳"],
  ["reads", "상대 읽기"],
  ["continuation", "계속 참여 가치"],
  ["library", "문헌"]
];

// Secondary nav shared by the reading pages of 연구소.
export default function NoteNav({ page, go }) {
  return (
    <nav className="note-nav" aria-label="연구 노트">
      {NOTES.map(([id, label]) => (
        <button key={id} className={page === id ? "on" : ""} aria-current={page === id ? "page" : undefined} onClick={() => go(id)}>
          {label}
        </button>
      ))}
    </nav>
  );
}

export function Ext({ href, children, className }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener">
      {children}
    </a>
  );
}
