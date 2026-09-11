#!/usr/bin/env python3
"""Build the Drill/Learn spot pack from the public PokerBench test CSVs.

Source: https://huggingface.co/datasets/RZ412/PokerBench  (Apache-2.0)
Paper:  https://arxiv.org/abs/2501.08328
Preflop labels: GTOWizard. Postflop labels: WASM-Postflop.

Expected inputs (download once into scripts/tmp/):
  preflop_1k_test_set_game_scenario_information.csv
  postflop_10k_test_set_game_scenario_information.csv
"""

from __future__ import annotations

import ast
import csv
import json
import random
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "scripts" / "tmp"
OUT = ROOT / "lib" / "data" / "pokerbench-spots.json"

PREFLOP_CSV = TMP / "preflop_1k_test.csv"
POSTFLOP_CSV = TMP / "postflop_10k_test.csv"

SEED = 20250910
TURN_CAP = 1000
RIVER_CAP = 1000


def parse_moves(raw: str) -> list[str]:
    try:
        value = ast.literal_eval(raw)
        return [str(x) for x in value]
    except Exception:
        return [part.strip(" '") for part in raw.strip("[]").split(",") if part.strip()]


def family(decision: str) -> str:
    token = decision.lower().strip()
    for name in ("check", "call", "fold", "bet", "raise", "allin"):
        if token.startswith(name) or token == "all-in":
            return "allin" if name == "allin" else name
    if token.endswith("bb"):
        return "raise"
    return "other"


def load_preflop() -> list[dict]:
    rows = []
    with PREFLOP_CSV.open(newline="") as handle:
        for index, row in enumerate(csv.DictReader(handle)):
            moves = parse_moves(row["available_moves"])
            if len(moves) < 2:
                continue
            answer = row["correct_decision"]
            if answer not in moves:
                continue
            rows.append(
                {
                    "id": f"pf-{index}",
                    "pos": row["hero_pos"],
                    "h": row["hero_holding"],
                    "line": row["prev_line"],
                    "a": answer,
                    "m": moves,
                    "pot": float(row["pot_size"]),
                    "n": int(row["num_players"] or 0),
                    "bets": int(row["num_bets"] or 0),
                }
            )
    return rows


def load_postflop() -> list[dict]:
    rows = []
    with POSTFLOP_CSV.open(newline="") as handle:
        for index, row in enumerate(csv.DictReader(handle)):
            moves = parse_moves(row["available_moves"])
            if len(moves) < 2:
                continue
            answer = row["correct_decision"]
            if answer not in moves:
                continue
            street = row["evaluation_at"]
            board = [row["board_flop"]]
            if street in ("Turn", "River"):
                board.append(row["board_turn"])
            if street == "River":
                board.append(row["board_river"])
            rows.append(
                {
                    "id": f"po-{index}",
                    "st": street,
                    "hp": row["hero_position"],
                    "h": row["holding"],
                    "pf": row["preflop_action"],
                    "b": board,
                    "pa": row["postflop_action"],
                    "a": answer,
                    "m": moves,
                    "pot": float(row["pot_size"]),
                    "ag": row["aggressor_position"],
                }
            )
    return rows


def sample_street(rows: list[dict], cap: int) -> list[dict]:
    if len(rows) <= cap:
        return rows
    buckets: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        buckets[f"{row['hp']}|{family(row['a'])}"].append(row)
    rng = random.Random(SEED)
    for bucket in buckets.values():
        rng.shuffle(bucket)
    picked: list[dict] = []
    while len(picked) < cap:
        progressed = False
        for bucket in buckets.values():
            if bucket and len(picked) < cap:
                picked.append(bucket.pop())
                progressed = True
        if not progressed:
            break
    return picked


def main() -> None:
    if not PREFLOP_CSV.exists() or not POSTFLOP_CSV.exists():
        raise SystemExit(
            "Missing PokerBench CSVs in scripts/tmp/. Download the test files from "
            "https://huggingface.co/datasets/RZ412/PokerBench"
        )

    preflop = load_preflop()
    postflop = load_postflop()
    by_street: dict[str, list[dict]] = defaultdict(list)
    for row in postflop:
        by_street[row["st"]].append(row)

    selected = (
        by_street["Flop"]
        + sample_street(by_street["Turn"], TURN_CAP)
        + sample_street(by_street["River"], RIVER_CAP)
    )
    selected.sort(key=lambda row: (["Flop", "Turn", "River"].index(row["st"]), row["id"]))

    payload = {
        "meta": {
            "name": "PokerBench",
            "license": "Apache-2.0",
            "url": "https://huggingface.co/datasets/RZ412/PokerBench",
            "paper": "https://arxiv.org/abs/2501.08328",
            "game": "6-max No-Limit Hold'em, 100bb cash",
            "preflop": "GTOWizard",
            "postflop": "WASM-Postflop",
            "note": "Labels are the solver's highest-frequency action (argmax), not mixed frequencies or EV.",
        },
        "preflop": preflop,
        "postflop": selected,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {OUT.relative_to(ROOT)} "
        f"({len(preflop)} preflop, {len(by_street['Flop'])} flop, "
        f"{sum(1 for r in selected if r['st']=='Turn')} turn, "
        f"{sum(1 for r in selected if r['st']=='River')} river, "
        f"{OUT.stat().st_size} bytes)"
    )


if __name__ == "__main__":
    main()
