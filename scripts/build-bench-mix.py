#!/usr/bin/env python3
"""Aggregate PokerBench preflop labels into shrinkage-ready mix tables.

Uses first-in-front-of-hero decisions only, so the keys match Live's
single-orbit action model. Counts are argmax labels, not solver mixes.

Inputs (scripts/tmp/):
  preflop_60k_train.csv
  preflop_1k_test.csv
"""

from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "scripts" / "tmp"
OUT = ROOT / "lib" / "data" / "bench-mix.json"
RANKS = "AKQJT98765432"
FILES = [
    TMP / "preflop_60k_train.csv",
    TMP / "preflop_1k_test.csv",
]


def hand_class(holding: str) -> str:
    a, b = holding[0], holding[2]
    suited = holding[1] == holding[3]
    if a == b:
        return a + b
    ia, ib = RANKS.index(a), RANKS.index(b)
    high, low = (a, b) if ia < ib else (b, a)
    return high + low + ("s" if suited else "o")


def bucket(hand: str) -> str:
    if len(hand) == 2:
        rank = RANKS.index(hand[0])
        if rank <= 1:
            return "QQ+"
        if rank <= 3:
            return "TT-JJ"
        if rank <= 6:
            return "77-99"
        return "22-66"
    suited = hand.endswith("s")
    high, low = hand[0], hand[1]
    if high == "A":
        return "Axs" if suited else "Axo"
    if high == "K" and RANKS.index(low) <= 4:
        return "Kbroad"
    if suited and RANKS.index(low) - RANKS.index(high) <= 3:
        return "sc"
    if not suited and RANKS.index(high) <= 3 and RANKS.index(low) <= 5:
        return "broadway-o"
    return "offsuit"


def classify_line(line: str, hero: str):
    if not line:
        return "rfi", None, None, False
    parts = line.split("/")
    opener = None
    three = None
    level = 0
    limpers = []
    acted = False
    for i in range(0, len(parts) - 1, 2):
        pos, act = parts[i], parts[i + 1].lower()
        if pos == hero:
            acted = True
        if act == "fold":
            continue
        if act == "call" and level < 2:
            limpers.append(pos)
            level = max(level, 1)
        elif act.endswith("bb") or act == "allin":
            if level < 2:
                opener = pos
                level = 2
            elif level < 3:
                three = pos
                level = 3
            else:
                three = pos
                level = 4
    if acted:
        return "hero-acted", opener, three, True
    if level <= 1 and limpers:
        return "limp", opener, three, False
    if level <= 1:
        return "rfi", opener, three, False
    if level == 2:
        return "vsOpen", opener, three, False
    if level == 3:
        return "vs3bet", opener, three, False
    return "vs4bet", opener, three, False


def family(decision: str, kind: str) -> str:
    token = decision.lower().strip()
    if token == "fold":
        return "Fold"
    if token == "call":
        return "Limp" if kind == "rfi" else "Call"
    if token == "check":
        return "Check"
    if token in {"allin", "all-in"}:
        return "All-in"
    if kind == "rfi":
        return "Open"
    if kind == "limp":
        return "Raise"
    if kind == "vsOpen":
        return "3-bet"
    if kind == "vs3bet":
        return "4-bet"
    return "All-in"


def pack(counter: Counter, min_n: int) -> dict | None:
    n = sum(counter.values())
    if n < min_n:
        return None
    out = {"n": n}
    for label, count in counter.items():
        if count > 0:
            out[label] = count
    return out


def main() -> None:
    found = [path for path in FILES if path.exists()]
    if not found:
        raise SystemExit("Missing PokerBench preflop CSVs in scripts/tmp/")

    exact: dict[str, Counter] = defaultdict(Counter)
    opener: dict[str, Counter] = defaultdict(Counter)
    buckets: dict[str, Counter] = defaultdict(Counter)
    vs_buckets: dict[str, Counter] = defaultdict(Counter)
    n_first = 0

    for path in found:
        with path.open(newline="") as handle:
            for row in csv.DictReader(handle):
                hero = row["hero_pos"]
                kind, open_pos, three, acted = classify_line(row.get("prev_line") or "", hero)
                if acted or kind == "hero-acted":
                    continue
                n_first += 1
                hand = hand_class(row["hero_holding"])
                label = family(row["correct_decision"], kind)
                exact[f"{kind}|{hero}|{hand}"][label] += 1
                buckets[f"{kind}|{hero}|{bucket(hand)}"][label] += 1
                extra = open_pos if kind == "vsOpen" else three if kind in {"vs3bet", "vs4bet"} else None
                if extra:
                    opener[f"{kind}|{hero}|{extra}|{hand}"][label] += 1
                    vs_buckets[f"{kind}|{hero}|{extra}|{bucket(hand)}"][label] += 1

    def compact(store, min_n):
        out = {}
        for key, val in store.items():
            packed = pack(val, min_n)
            if packed:
                out[key] = packed
        return out

    payload = {
        "meta": {
            "name": "PokerBench",
            "license": "Apache-2.0",
            "url": "https://huggingface.co/datasets/RZ412/PokerBench",
            "note": "Argmax GTO labels aggregated into empirical frequencies for first-action 6-max spots.",
            "n": n_first,
            "files": [path.name for path in found],
        },
        "e": compact(exact, 2),
        "o": compact(opener, 3),
        "b": compact(buckets, 5),
        "vb": compact(vs_buckets, 4),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {OUT.relative_to(ROOT)} n={n_first} "
        f"exact={len(payload['e'])} opener={len(payload['o'])} "
        f"bucket={len(payload['b'])} vsBucket={len(payload['vb'])} "
        f"bytes={OUT.stat().st_size}"
    )


if __name__ == "__main__":
    main()
