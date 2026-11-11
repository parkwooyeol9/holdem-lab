"use client";

import { useState } from "react";
import NoteNav, { Ext } from "./NoteNav";

// Synthetic teaching example from the continuation-value note (§4). Units are chips.
const M = {
  flopBet: 2,
  turnBet: 6,
  riverBet: 10,
  finalPot: 46,
  strongTurn: 0.25,
  goodRiver: { strong: 0.75, weak: 0.15 },
  equity: { good: 0.75, bad: 0.1 }
};

function flopCallValue(foldTurn, foldRiver) {
  const river = (equity) => {
    const call = equity * M.finalPot - M.riverBet;
    return foldRiver ? Math.max(0, call) : call;
  };
  const turn = (pGood) => {
    const call = -M.turnBet + pGood * river(M.equity.good) + (1 - pGood) * river(M.equity.bad);
    return foldTurn ? Math.max(0, call) : call;
  };
  return -M.flopBet + M.strongTurn * turn(M.goodRiver.strong) + (1 - M.strongTurn) * turn(M.goodRiver.weak);
}

const chips = (v) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2);
const CASES = [
  [false, false, "턴·리버 모두 콜 강제"],
  [true, false, "턴에서만 폴드 가능"],
  [false, true, "리버에서만 폴드 가능"],
  [true, true, "턴·리버 모두 폴드 가능"]
];

export default function Continuation({ go }) {
  const [foldTurn, setFoldTurn] = useState(true);
  const [foldRiver, setFoldRiver] = useState(true);
  const value = flopCallValue(foldTurn, foldRiver);

  return (
    <main className="wrap">
      <section className="panel">
        <NoteNav page="continuation" go={go} />
        <header className="section-head">
          <div>
            <p className="kicker">RESEARCH NOTE / ORIGINAL IDEA</p>
            <h2>플랍의 콜은 미래의 선택권을 산다</h2>
            <p>옵션 이항 트리의 &lsquo;뒤에서부터 거슬러 계산하기&rsquo;를 포커의 플랍 → 턴 → 리버에 옮겨 본 교육용 사례입니다.</p>
          </div>
          <a className="outline" href="/research/02_Poker_Continuation_Value_Model.md" download>
            전체 계산 내려받기 ↓
          </a>
        </header>

        <div className="calc">
          <div className="calc-inputs">
            <p className="kicker">같은 플랍 콜, 다른 미래</p>
            <label className="check">
              <input type="checkbox" checked={foldTurn} onChange={(e) => setFoldTurn(e.target.checked)} /> 턴에서 폴드할 수 있다
            </label>
            <label className="check">
              <input type="checkbox" checked={foldRiver} onChange={(e) => setFoldRiver(e.target.checked)} /> 리버에서 폴드할 수 있다
            </label>
            <table className="mini">
              <tbody>
                {CASES.map(([t, r, label]) => (
                  <tr key={label} className={t === foldTurn && r === foldRiver ? "on" : ""}>
                    <th>{label}</th>
                    <td>{chips(flopCallValue(t, r))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="calc-result" aria-live="polite">
            <p className="kicker">플랍 콜의 기대값</p>
            <strong>{chips(value)} 칩</strong>
            <p>
              {value >= 0
                ? "나쁜 신호에는 접고 좋은 신호에만 계속할 수 있어서, 2칩짜리 콜이 이익이 됩니다."
                : "뒤 스트리트에서 접을 수 없다면, 같은 콜이 손해가 됩니다. 이때 최선은 플랍에서 폴드(0)입니다."}
            </p>
            <p className="calc-sub">카드와 베팅 확률은 모두 합성 가정이며 실제 핸드의 추천값이 아닙니다.</p>
          </div>
        </div>

        <div className="heading-row">
          <div>
            <p className="kicker">ASSUMPTIONS</p>
            <h3>예시의 가정</h3>
          </div>
        </div>
        <div className="local-grid">
          <article>
            <h4>베팅</h4>
            <p>플랍 팟 10에 상대가 2를 베팅. 턴에 6, 리버에 10을 베팅하고, 나는 콜 또는 폴드만 할 수 있습니다. 리버까지 콜하면 팟은 46입니다.</p>
          </article>
          <article>
            <h4>카드 신호</h4>
            <p>턴이 강한 신호일 확률 25%. 리버가 유리할 확률은 강한 턴 뒤 75%, 약한 턴 뒤 15%입니다.</p>
          </article>
          <article>
            <h4>쇼다운</h4>
            <p>유리한 리버에서 승률 75%, 불리한 리버에서 10%. 리버 콜은 유리할 때 +24.5, 불리할 때 −5.4입니다.</p>
          </article>
        </div>

        <div className="heading-row">
          <div>
            <p className="kicker">WHAT CARRIES OVER</p>
            <h3>옵션에서 가져온 것과 가져올 수 없는 것</h3>
          </div>
        </div>
        <div className="split">
          <article>
            <span className="chip green">가져온 것</span>
            <h4>지금 멈출지, 계속할지의 비교</h4>
            <p>
              콜은 비용을 내고 팟에 대한 자격과 이후의 선택을 유지하는 일이고, 폴드는 추가 지출 없이 그 자격을 포기하는 일입니다. 뒤 스트리트의 값을 먼저 구한 뒤 앞으로
              거슬러 오면, &lsquo;평균 승률&rsquo; 하나로는 보이지 않던 차이가 드러납니다.
            </p>
          </article>
          <article>
            <span className="chip">가져올 수 없는 것</span>
            <h4>무위험 차익 논리와 두 갈래 요약</h4>
            <p>
              포커에는 복제할 기초자산도 무위험 이자율도 없습니다. 확률은 덱과 상대의 베팅 모델에서 나옵니다. 실제 포스트플랍을 좋은 카드·나쁜 카드 두 갈래로 줄이면
              미래 승률의 분포를 잃을 수 있어, 얼마나 잃는지는 따로 측정해야 합니다.
            </p>
          </article>
        </div>
        <p className="note">
          근거 수준: 아이디어 단계입니다. 옵션 유추를 다룬 공개 프로토타입은 이미 있고, 실제 홀덤에서 이 압축이 솔버 대비 얼마나 손해인지에 대한 동료심사 검증은 찾지
          못했습니다. <Ext href="https://doi.org/10.1016/0304-405X(79)90015-1">Cox–Ross–Rubinstein 1979 ↗</Ext>{" "}
          <Ext href="https://poker.cs.ualberta.ca/publications/AAMAS13-abstraction.pdf">요약이 잃는 정보 · Johanson 2013 ↗</Ext>
        </p>
      </section>
    </main>
  );
}
