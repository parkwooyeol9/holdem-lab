"use client";

import { useState } from "react";
import NoteNav, { Ext } from "./NoteNav";

const DEPTHS = [
  ["100BB", 100, "깊이보다 포지션의 가치", "콜과 3벳 이후에도 여러 스트리트의 선택지가 남습니다. 작은 페어와 수딧 핸드는 넛 잠재력·포지션·상대의 지불 능력을 함께 평가합니다.", "원페어로 스택 전체를 넣는 기준을 보수적으로 잡고, 큰 팟에서는 상대의 넛 조합과 리버까지의 베팅 경로를 계산합니다.", "평균이 100BB여도 상대가 15BB라면 그 상대와는 15BB 게임입니다."],
  ["80BB", 80, "임플라이드 오즈의 조건", "100BB와 80BB 사이에 보편적인 전략 절벽은 없습니다. 콜 비용 대비 상대에게서 더 받을 수 있는 금액이 줄어드는 연속적인 변화로 봅니다.", "넛이 아닌 플러시·약한 탑페어의 역임플라이드 오즈를 점검합니다. 큰 3벳에 포지션 없이 따라가는 비용을 계산합니다.", "스택 구간 설명은 교육용 종합 해석입니다. 80BB 전용 솔버 빈도를 계산한 표가 아닙니다."],
  ["50BB", 50, "포스트플랍 여유와 재레이즈 비용", "오픈·콜·비올인 3벳이 여전히 중요한 구간입니다. 큰 3벳을 콜한 뒤 셋을 못 맞히면 접겠다는 계획은 비용 대비 잠재 이익을 검토해야 합니다.", "3벳 팟의 SPR이 빠르게 낮아집니다. 콜 이후 유리한 보드뿐 아니라 오버카드·드로우 보드의 다음 행동을 정합니다.", "항상 콜이 안전하다는 생각을 버립니다. 뒤 선수의 스퀴즈와 이후 스트리트의 투자도 비용입니다."],
  ["30BB", 30, "3벳 뒤의 스택을 먼저 본다", "2.2BB 오픈에 7BB 3벳을 받았다면 콜 비용은 4.8BB입니다. 앤티를 빼면 30BB 시작 스택은 콜 후 23BB가 남습니다. 폴드·콜·4벳의 후속 계획을 함께 세웁니다.", "낮아진 SPR에서 탑페어와 오버페어의 가치가 달라지지만, 스택을 넣을지는 보드·레인지·ICM에 달려 있습니다.", "A5s의 블로커만 보고 4벳 올인하지 않습니다. 상대의 폴드 빈도와 콜 범위가 필요합니다."],
  ["15BB", 15, "먼저 미는 힘과 콜의 문턱", "오픈 올인·리쇼브의 중요성이 커집니다. 일부 포지션과 구조에서는 작은 오픈이나 림프도 남으므로 전 핸드를 푸시/폴드로 단순화하지 않습니다.", "프리플랍에서 콜할 때 이미 다음 스트리트의 투자 계획을 생각합니다. 작은 팟 확보도 내 스택에서 차지하는 비중이 큽니다.", "15BB라는 숫자 하나로 AJo·66의 올인 콜을 결정할 수 없습니다. 잼한 자리·범위·상금표가 필요합니다."],
  ["10BB", 10, "위치와 데드머니를 계산", "짧은 스택에서는 폴드 에퀴티를 가진 선제 올인 기회가 중요합니다. 남은 선수 수·앤티·콜할 상대의 스택을 함께 확인합니다.", "열고 접으면 잃는 스택 비중이 큽니다. 허용 액션과 범위는 자리별로 다르며, BB 방어·SB 림프 등의 예외도 검토합니다.", "딱 10BB부터 모든 상황이 푸시/폴드라는 보편 법칙은 없습니다."],
  ["10BB 미만", 8, "시간 비용", "앤티와 곧 도착할 블라인드가 실제 선택권을 줄입니다. 예를 들어 8BB에 2BB를 넣고 폴드하면 시작 스택의 25%를 잃습니다.", "남은 칩이 작아 핸드의 원시 승률과 프리플랍 폴드 에퀴티의 비중이 커집니다. 한 번 더 기다리는 행동도 다음 자리의 비용을 갖습니다.", "헤즈업이 되면 확정된 2등 상금 위의 추가 상금 가치가 표준 ICM에서 칩 지분에 선형이 됩니다. 다인 파이널테이블의 위험 프리미엄을 그대로 옮기지 않습니다."]
];
const STAGES = {
  normal: ["일반 진행", "깊이별 방향은 나와 상대가 모두 평균 부근일 때의 출발점입니다. 테이블에서 가장 짧은 상대에게는 그 유효 깊이의 계획을 다시 적용합니다."],
  bubble: ["머니 버블", "중간 스택은 리더에게 커버되면서 숏스택의 탈락을 기다릴 유인도 가집니다. 먼저 거는 압박과 올인을 받는 콜의 범위를 구분합니다."],
  final: ["파이널테이블", "중간 스택은 리더에게 커버되면서 숏스택의 탈락을 기다릴 유인도 가집니다. 먼저 거는 압박과 올인을 받는 콜의 범위를 구분합니다."]
};
const SEATS = {
  avg: ["평균 수준", "평균 부근의 중간 스택은 큰 스택에 커버되고 작은 스택의 탈락으로 이익을 얻을 수 있습니다. 특히 상금 점프가 클 때 올인 콜의 손익을 따로 계산합니다."],
  lead: ["칩리더", "내가 커버하는 중간 스택에 압박할 기회를 찾습니다. 다른 대형 스택을 상대할 때는 한 번 진 뒤에도 리더 지위와 커버 관계가 유지되는지 계산합니다."],
  short: ["숏스택", "오픈할 기회와 올인을 콜할 기회를 분리합니다. 내가 최단기인지, 더 짧은 선수가 언제 블라인드를 내는지 확인하며 무조건적인 대기와 무조건적인 올인을 모두 재검토합니다."]
};

const STACKS = {
  skew: ["비대칭", [40, 30, 20, 10]],
  even: ["균등", [25, 25, 25, 25]],
  polar: ["리더와 초단기", [72, 30, 12, 6]]
};
const PAYOUTS = {
  std: ["50 / 30 / 20 / 0", [50, 30, 20, 0]],
  flat: ["40 / 30 / 20 / 10", [40, 30, 20, 10]],
  wta: ["100 / 0 / 0 / 0", [100, 0, 0, 0]]
};
const NAMES = ["상대", "나", "선수 C", "선수 D"];

// Malmuth–Harville ICM: prize equity of player `me` given stacks and payouts.
function icm(stacks, payouts, me) {
  const total = stacks.reduce((a, b) => a + b, 0);
  if (!payouts.length || total <= 0) return 0;
  let value = 0;
  stacks.forEach((stack, j) => {
    if (stack <= 0) return;
    const p = stack / total;
    if (j === me) value += p * payouts[0];
    else {
      const rest = stacks.slice();
      rest[j] = 0;
      value += p * icm(rest, payouts.slice(1), me);
    }
  });
  return value;
}

function Seg({ label, options, value, set }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      <small>{label}</small>
      <div>
        {Object.entries(options).map(([id, [name]]) => (
          <button key={id} type="button" className={value === id ? "on" : ""} aria-pressed={value === id} onClick={() => set(id)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

const SOURCES = [
  ["T1", "스택 크기가 레인지를 어떻게 바꾸는가", "https://blog.gtowizard.com/how-stack-sizes-change-your-range/"],
  ["T2", "언제 순위 상승을 기다릴 것인가", "https://blog.gtowizard.com/when-to-ladder-in-tournaments/"],
  ["T3", "포스트플랍 ICM에서 피해야 할 실수", "https://blog.gtowizard.com/mastering-postflop-icm-avoid-these-common-mistakes/"],
  ["T4", "독립 칩 모형의 경험적 검증 (IEEE CoG 2025)", "https://arxiv.org/abs/2506.00180"]
];

export default function DeepTournament({ go }) {
  const [depth, setDepth] = useState(3);
  const [stage, setStage] = useState("normal");
  const [seat, setSeat] = useState("avg");
  const [dist, setDist] = useState("skew");
  const [pay, setPay] = useState("std");
  const [win, setWin] = useState(55);

  const [label, bb, title, first, second, caution] = DEPTHS[depth];
  const stacks = STACKS[dist][1];
  const payouts = PAYOUTS[pay][1];
  const risk = Math.min(stacks[0], stacks[1]);
  const after = (delta) => stacks.map((s, i) => (i === 1 ? s + delta : i === 0 ? s - delta : s));
  const decline = icm(stacks, payouts, 1);
  const vWin = icm(after(risk), payouts, 1);
  const vLose = icm(after(-risk), payouts, 1);
  const breakEven = ((decline - vLose) / (vWin - vLose)) * 100;
  const edge = (win / 100) * vWin + (1 - win / 100) * vLose - decline;

  return (
    <main className="wrap">
      <section className="panel">
        <NoteNav page="depth" go={go} />
        <header className="section-head">
          <div>
            <p className="kicker">RESEARCH NOTE / TOURNAMENT DEPTH</p>
            <h2>평균 100BB에서 파이널테이블 8BB까지</h2>
            <p>스택의 깊이, 전체 칩 분포, 상금 구조를 함께 읽습니다. QPC 플라이트의 초반부터 파이널까지 같은 순서로 봅니다.</p>
          </div>
          <a className="outline" href="/research/04_Tournament_Stack_Study_KO.md" download>
            연구 전문 ↓
          </a>
        </header>
        <p className="note">
          <b>입력의 순서</b> · 평균 BB = 남은 전체 칩 ÷ 남은 선수 수 ÷ 현재 BB. 프리플랍 유효 스택은 두 선수 중 작은 쪽입니다. 파이널테이블에서는 모든 스택과 상금표를
          더합니다.
        </p>

        <div className="seg depth-seg" role="group" aria-label="평균 스택">
          <div>
            {DEPTHS.map(([name], i) => (
              <button key={name} type="button" className={depth === i ? "on" : ""} aria-pressed={depth === i} onClick={() => setDepth(i)}>
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="seg-row">
          <Seg label="대회 단계" options={STAGES} value={stage} set={setStage} />
          <Seg label="내 상대적 위치" options={SEATS} value={seat} set={setSeat} />
        </div>
        <div className="feature decision" aria-live="polite">
          <div>
            <p className="kicker">
              평균 {bb}BB · {STAGES[stage][0]}
            </p>
            <h3>
              {label} · {title}
            </h3>
            <p>{first}</p>
            <p>{second}</p>
          </div>
          <div className="aside-notes">
            <p className="kicker">{SEATS[seat][0]}의 조정</p>
            <p>{STAGES[stage][1]}</p>
            <p>{SEATS[seat][1]}</p>
            <p className="calc-sub">{caution}</p>
          </div>
        </div>

        <div className="heading-row">
          <div>
            <p className="kicker">SAME AVERAGE, DIFFERENT TABLE</p>
            <h3>같은 평균, 다른 테이블</h3>
          </div>
        </div>
        <div className="stay-table" role="region" aria-label="같은 평균 다른 테이블" tabIndex={0}>
          <table className="notes">
            <thead>
              <tr>
                <th>4명 · 평균 30BB</th>
                <th>전체 스택</th>
                <th>판단에 필요한 차이</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>균등 분포</th>
                <td>30 / 30 / 30 / 30</td>
                <td>서로 비슷한 탈락 위험. 가까운 상금 점프와 자리를 비교합니다.</td>
              </tr>
              <tr>
                <th>리더와 초단기</th>
                <td>72 / 30 / 12 / 6</td>
                <td>같은 30BB라도 큰 스택에 커버되고, 두 숏스택의 탈락을 기다릴 가치가 있습니다.</td>
              </tr>
              <tr>
                <th>헤즈업 · 평균 30BB</th>
                <td>45 / 15</td>
                <td>유효 15BB. 표준 ICM에서 확정된 2등 상금 위의 가치는 칩 지분에 선형입니다.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="heading-row" id="icm">
          <div>
            <p className="kicker">ICM LAB</p>
            <h3>{win}% 승률인데도 접는 이유</h3>
            <p className="muted">
              4명 중 내가 상대와 {risk}BB씩을 거는 교육용 제안입니다. 블라인드·앤티·데드머니·무승부·폴드 에퀴티는 0이고, 거절하면 스택이 그대로 남습니다.
            </p>
          </div>
        </div>
        <div className="seg-row">
          <Seg label="스택 분포" options={STACKS} value={dist} set={setDist} />
          <Seg label="상금 구조" options={PAYOUTS} value={pay} set={setPay} />
        </div>
        <div className="calc">
          <div className="calc-inputs">
            <label className="slider">
              <span>
                가정한 승률 <b>{win}%</b>
              </span>
              <input type="range" min="1" max="99" value={win} onChange={(e) => setWin(Number(e.target.value))} />
            </label>
            <table className="mini">
              <tbody>
                {stacks.map((s, i) => (
                  <tr key={NAMES[i]} className={i === 1 ? "on" : ""}>
                    <th>{NAMES[i]}</th>
                    <td>{s}BB</td>
                    <td>상금 지분 {icm(stacks, payouts, i).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="calc-result" aria-live="polite">
            <p className="kicker">ICM 손익분기 승률</p>
            <strong>{breakEven.toFixed(1)}%</strong>
            <p>
              칩으로만 보면 50%면 충분하지만, 상금으로 보면 {breakEven.toFixed(1)}%가 필요합니다. 위험 프리미엄은 {(breakEven - 50).toFixed(1)}%p입니다.
            </p>
            <p>
              승률 {win}%로 참여하면 거절할 때보다 상금 기대값이{" "}
              <b>
                {edge >= 0 ? "+" : "−"}
                {Math.abs(edge).toFixed(2)}
              </b>{" "}
              {edge >= 0 ? "늘어납니다." : "줄어듭니다."}
            </p>
            <p className="calc-sub">
              거절 {decline.toFixed(2)} · 승리 {vWin.toFixed(2)} · 패배 {vLose.toFixed(2)} (상금 총액 100 기준). 승패 뒤의 전체 스택을 다시 평가한 값입니다.
            </p>
          </div>
        </div>
        <p className="note">
          표준 ICM은 칩 지분을 순위 확률로 바꾸는 모형입니다. 실력·포지션·다가올 블라인드·바운티는 반영하지 않으며, PKO와 새틀라이트에는 별도 모형이 필요합니다. 실증 연구는
          ICM이 큰 스택을 낮게, 숏스택을 높게 평가하는 경향을 보고합니다. 실제 진행 중인 핸드의 콜 계산과도 구분해 읽으세요.
        </p>

        <div className="heading-row">
          <div>
            <p className="kicker">SOURCES</p>
            <h3>영문 원문</h3>
          </div>
        </div>
        <p className="sources src-list">
          {SOURCES.map(([id, name, href]) => (
            <Ext key={id} href={href}>
              {id} · {name} ↗
            </Ext>
          ))}
        </p>
      </section>
    </main>
  );
}
