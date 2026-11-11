"use client";

import { useState } from "react";
import NoteNav, { Ext } from "./NoteNav";

const BANDS = [
  [15, "폴드 에퀴티와 올인 후 위험을 먼저 계산한다. 작은 레이즈 뒤 남는 선택지까지 한 번에 계획한다."],
  [25, "리쇼브와 레이즈 후 폴드의 비용이 커진다. 작은 페어·수딧 커넥터의 콜을 깊은 스택처럼 평가하지 않는다."],
  [40, "3벳 팟에서 남는 스택과 팟의 비율이 빠르게 작아진다. 프리플랍 콜 전에 불리한 플랍의 대응을 정한다."],
  [Infinity, "포지션과 넛 잠재력, 여러 스트리트의 가치 실현을 함께 본다. 딥스택이라고 모든 드로우의 콜이 이익인 것은 아니다."]
];

// 30BB effective, open 2.2BB, 3-bet to 7BB, heads-up. `dead` is blind money left in by players who folded.
const OPEN = 2.2;
const THREE_BET = 7;
const STACK = 30;
const SPOTS = {
  "btn-sb": {
    label: "BTN 오픈 → SB 3벳",
    dead: 1,
    deadNote: "BB의 1BB",
    position: "늦은 자리 오픈과 블라인드 대응에서는 비교적 넓은 레인지가 가능하며, 콜하면 포지션을 가집니다."
  },
  "utg-btn": {
    label: "UTG 오픈 → BTN 3벳",
    dead: 1.5,
    deadNote: "SB·BB의 1.5BB",
    position: "앞자리 오픈에 대한 3벳은 더 강한 범위를 가정할 이유가 있습니다. 콜 이후에는 포지션도 불리합니다."
  }
};
const VILLAINS = {
  tight: ["타이트", "강한 범위에 콜 비용을 지불할까?"],
  aggro: ["공격적", "상대의 압박은 얼마나 넓을까?"],
  unknown: ["정보 부족", "관찰 전에는 기본 가정을 보수적으로."]
};
const PHASES = {
  normal: ["일반 구간", "칩 기대값을 출발점으로 하되 앤티와 대회 상금 구조를 함께 확인합니다."],
  bubble: [
    "버블 · 상대가 커버",
    "상대가 나를 탈락시킬 수 있습니다. 상금·타 스택 없이 올인 콜의 정확한 문턱을 계산할 수 없으며, 콜과 먼저 미는 행동의 위험은 다릅니다."
  ]
};

function Slider({ label, value, set }) {
  return (
    <label className="slider">
      <span>
        {label} <b>{value} BB</b>
      </span>
      <input type="range" min="5" max="100" value={value} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}

function Seg({ label, options, value, set }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      <small>{label}</small>
      <div>
        {Object.entries(options).map(([id, opt]) => (
          <button key={id} type="button" className={value === id ? "on" : ""} aria-pressed={value === id} onClick={() => set(id)}>
            {Array.isArray(opt) ? opt[0] : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const one = (n) => (Math.round(n * 10) / 10).toLocaleString("ko-KR");

export default function Tournament({ go, start }) {
  const [mine, setMine] = useState(30);
  const [theirs, setTheirs] = useState(55);
  const [avg, setAvg] = useState(40);
  const [spot, setSpot] = useState("btn-sb");
  const [villain, setVillain] = useState("tight");
  const [phase, setPhase] = useState("normal");

  const effective = Math.min(mine, theirs);
  const band = BANDS.find(([max]) => effective <= max)[1];
  const covered = theirs >= mine;

  const s = SPOTS[spot];
  const callCost = THREE_BET - OPEN;
  const potAfterCall = THREE_BET * 2 + s.dead;
  const behind = STACK - THREE_BET;
  const needed = (callCost / potAfterCall) * 100;
  const spr = behind / potAfterCall;

  return (
    <main className="wrap">
      <section className="panel">
        <NoteNav page="tournament" go={go} />
        <header className="section-head">
          <div>
            <p className="kicker">RESEARCH NOTE / TOURNAMENT</p>
            <h2>몇 BB로 누구와 싸우고 있나요?</h2>
            <p>평균 스택은 대회의 맥락입니다. 상대와 실제로 주고받을 수 있는 칩은 유효 스택으로 봅니다.</p>
          </div>
        </header>

        <div className="calc">
          <div className="calc-inputs">
            <Slider label="내 스택" value={mine} set={setMine} />
            <Slider label="상대 스택" value={theirs} set={setTheirs} />
            <Slider label="대회 평균" value={avg} set={setAvg} />
          </div>
          <div className="calc-result" aria-live="polite">
            <p className="kicker">헤즈업 유효 스택</p>
            <strong>{effective} BB</strong>
            <p>{band}</p>
            <p className="calc-sub">
              {covered ? "상대가 나를 커버합니다. 이 팟에서 지면 탈락할 수 있습니다." : "내가 상대를 커버합니다. 이 팟에서 져도 칩이 남습니다."} 평균 대비 내 스택은{" "}
              {(mine / avg).toFixed(2)}배이지만, 이 비율만으로 진입 핸드를 넓히거나 줄이지 않습니다.
            </p>
          </div>
        </div>

        <div className="local-grid">
          <article>
            <h4>버블 · 파이널</h4>
            <p>상금 점프, 다른 단기 스택, 상대의 커버 여부를 확인합니다. 큰 스택을 상대로 칩 EV가 조금 양수인 콜도 상금 EV에서는 불리할 수 있습니다.</p>
          </article>
          <article>
            <h4>멀티웨이</h4>
            <p>가장 짧은 스택 하나로 전체 팟을 요약하지 않습니다. 각 상대의 커버 관계와 사이드팟을 따로 봅니다.</p>
          </article>
          <article>
            <h4>평균 40BB, 나는 30BB</h4>
            <p>상대가 12BB면 짧은 스택과의 위험을, 상대가 60BB면 내 탈락 위험을 검토합니다. 같은 평균 아래에서도 다른 의사결정입니다.</p>
          </article>
        </div>
        <p className="note">
          구간별 설명은 교육용 종합 해설입니다. PKO·새틀라이트는 별도 상금 모델이 필요합니다. 전략 노트의 &lsquo;41명 남음 · 27명 입상&rsquo; 사례를 이 계산기에 넣어 보세요.{" "}
          <Ext href="https://blog.gtowizard.com/how-icm-quietly-shapes-postflop-strategy-from-the-start/">ICM 영문 해설 ↗</Ext>
        </p>

        <div className="heading-row" id="threebet">
          <div>
            <p className="kicker">DECISION LAB · 30BB</p>
            <h3>30BB에서 3벳을 맞았다면</h3>
            <p className="muted">유효 스택 30BB · 오픈 2.2BB · 3벳 7BB · 헤즈업 가정. 조건을 바꾸면 해설과 숫자가 달라집니다.</p>
          </div>
        </div>
        <div className="seg-row">
          <Seg label="포지션" options={SPOTS} value={spot} set={setSpot} />
          <Seg label="상대 성향" options={VILLAINS} value={villain} set={setVillain} />
          <Seg label="대회 상황" options={PHASES} value={phase} set={setPhase} />
        </div>
        <div className="feature decision" aria-live="polite">
          <div>
            <p className="kicker">조건부 전략 해설</p>
            <h3>{VILLAINS[villain][1]}</h3>
            <p>{s.position}</p>
            <p>{PHASES[phase][1]}</p>
          </div>
          <dl className="price">
            <div>
              <dt>콜 비용</dt>
              <dd>{one(callCost)} BB</dd>
            </div>
            <div>
              <dt>콜 후 팟</dt>
              <dd>{one(potAfterCall)} BB</dd>
            </div>
            <div>
              <dt>필요 승률</dt>
              <dd>{Math.round(needed)}%</dd>
            </div>
            <div>
              <dt>남는 스택 ÷ 팟</dt>
              <dd>{spr.toFixed(1)}</dd>
            </div>
          </dl>
        </div>
        <p className="note">
          숫자는 앤티를 빼고 접은 블라인드({s.deadNote})만 팟에 더한 가정입니다. 필요 승률은 쇼다운까지 간다고 볼 때의 최소치이고, 남는 스택이 팟의 {spr.toFixed(1)}배뿐이라
          플랍에서 한 번 더 넣으면 사실상 올인입니다.
        </p>

        <div className="strategy-grid">
          <article>
            <p className="kicker">FOLD</p>
            <h3>폴드</h3>
            <p>이미 넣은 2.2BB는 매몰비용입니다. 상대 레인지에 비해 불리한 핸드를 지키려고 추가 칩을 투입하지 않습니다.</p>
          </article>
          <article>
            <p className="kicker">CALL</p>
            <h3>콜</h3>
            <p>추가 비용은 4.8BB, 콜 후 내 스택은 23BB입니다. 블라인드와 앤티, 포지션을 확정한 뒤 팟과 남는 스택의 비율을 계산하고 불리한 플랍의 대응을 미리 정합니다.</p>
          </article>
          <article>
            <p className="kicker">4-BET / ALL-IN</p>
            <h3>4벳 · 올인</h3>
            <p>상대가 콜하는 범위와 폴드하는 빈도를 따로 추정합니다. 작은 4벳을 한다면 재올인에 대한 계획이 필요합니다.</p>
          </article>
        </div>

        <div className="heading-row">
          <div>
            <p className="kicker">THREE HANDS</p>
            <h3>AQs · TT · A5s를 같은 이유로 플레이하지 않기</h3>
          </div>
        </div>
        <div className="culture-list">
          <article>
            <span>AQs</span>
            <div>
              <p>강한 탑페어 잠재력과 블로커를 갖지만 상대의 지배적인 Ax·페어 범위에 주의합니다.</p>
            </div>
          </article>
          <article>
            <span>TT</span>
            <div>
              <p>오버카드 플랍에서 가치 실현이 어려워질 수 있습니다. 단순히 셋을 맞힐 기대만으로 콜하지 않습니다.</p>
            </div>
          </article>
          <article>
            <span>A5s</span>
            <div>
              <p>에이스 블로커가 있어도 블러프 4벳이 자동으로 이익이 되지는 않습니다. 상대의 폴드 빈도가 핵심입니다.</p>
            </div>
          </article>
        </div>
        <p className="note">
          이 노트는 레인지 사고 훈련이며 특정 핸드의 솔버 빈도를 산출하지 않습니다. 100bb 캐시 기준의 3벳 팟 감각은 드릴에서 따로 확인하세요.{" "}
          <button className="text-button" onClick={() => start("3bet", "drill")}>
            3벳 팟 다섯 손 →
          </button>{" "}
          <Ext href="https://blog.gtowizard.com/aggregate-flop-strategy-sb-c-betting-in-srp/">30BB SB–BB 원문 사례 ↗</Ext>
        </p>
      </section>
    </main>
  );
}
