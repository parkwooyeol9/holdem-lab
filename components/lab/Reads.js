"use client";

import { useState } from "react";
import NoteNav, { Ext } from "./NoteNav";

const TYPES = [
  ["타이트 · 공격적", "진입은 선별하고 들어온 팟은 압박한다.", "앞자리의 큰 3벳에는 강한 레인지 가설을 먼저 세운다. 작은 표본만으로 모든 3벳을 프리미엄으로 단정하지 않는다.", "늦은 자리의 스틸과 앞자리의 밸류를 따로 기록한다."],
  ["루스 · 공격적", "넓은 진입과 잦은 압박을 결합한다.", "가치 있는 핸드의 방어를 지나치게 줄이지 않는다. 상대가 4벳에 실제로 접는지 확인한 뒤 블러프 조정을 검토한다.", "높은 공격 빈도가 곧 높은 블러프 빈도는 아니다. 보드와 베팅 크기를 함께 본다."],
  ["루스 · 수동적", "자주 참여하고 콜을 선호한다.", "얇은 밸류 베팅의 후보를 늘리고 큰 순수 블러프의 기대값을 재검토한다.", "평소 콜 위주인 상대의 갑작스러운 큰 레이즈를 별도 사건으로 기록한다."],
  ["타이트 · 수동적", "진입도 적고 레이즈도 드물다.", "빈 팟을 가져올 기회를 찾되 큰 저항에 맞서 억지로 팟을 키우지 않는다.", "좋은 핸드도 콜만 할 수 있으므로 체크를 약함으로 단정하지 않는다."]
];

function Pct({ label, value, set }) {
  return (
    <label className="slider">
      <span>
        {label} <b>{value}%</b>
      </span>
      <input type="range" min="5" max="95" step="5" value={value} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}

export default function Reads({ go }) {
  const [prior, setPrior] = useState(50);
  const [strongBets, setStrongBets] = useState(80);
  const [weakBets, setWeakBets] = useState(20);
  const strong = prior * strongBets;
  const posterior = Math.round((strong / (strong + (100 - prior) * weakBets)) * 100);

  return (
    <main className="wrap">
      <section className="panel">
        <NoteNav page="reads" go={go} />
        <header className="section-head">
          <div>
            <p className="kicker">RESEARCH NOTE / OBSERVATION</p>
            <h2>상대 읽기는 가설을 갱신하는 일</h2>
            <p>사람을 분류하기보다 반복되는 선택을 봅니다. 유형은 관찰을 정리하는 임시 가설입니다.</p>
          </div>
          <button className="outline" onClick={() => go("live")}>
            라이브 HUD에서 태깅 →
          </button>
        </header>

        <div className="split">
          <article>
            <span className="chip green">동료심사 연구 · 2013</span>
            <h4>포커 페이스보다 팔 동작?</h4>
            <p>
              Slepian 등의 영상 관찰 실험에서는 칩을 밀어 넣는 팔 동작에 핸드 강도의 단서가 나타났습니다. 통제된 관찰 결과이므로 실제 테이블의 확정 신호로 해석하기는
              어렵고, 특정 몸짓 하나로 블러프를 확정하는 규칙은 검증되지 않았습니다.
            </p>
            <Ext href="https://www.columbia.edu/~ms4992/Pubs/2013_Slepian-Young-Rutchick-Ambady_Poker_PychSci.pdf">영문 논문 ↗</Ext>
          </article>
          <article>
            <span className="chip">테이블 관찰 메모</span>
            <h4>몸짓 하나보다 평소 패턴의 변화</h4>
            <p>
              <b>평소 리듬</b> · 강약을 모르는 핸드에서도 기준선을 관찰. <b>행동 변화</b> · 시간, 크기, 말, 칩을 넣는 방식. <b>상황 통제</b> · 같은 스트리트와 비슷한 팟에서
              비교. <b>쇼다운 확인</b> · 맞힌 사례와 틀린 사례 모두 기록.
            </p>
          </article>
        </div>

        <div className="heading-row">
          <div>
            <p className="kicker">BAYES AT THE TABLE</p>
            <h3>행동은 레인지의 확률을 바꾼다</h3>
            <p className="muted">상대가 베팅했다는 사실만으로 강한 패일 확률이 얼마나 움직이는지 직접 바꿔 보세요.</p>
          </div>
        </div>
        <div className="calc">
          <div className="calc-inputs">
            <Pct label="베팅 전, 강한 패일 확률" value={prior} set={setPrior} />
            <Pct label="강한 패로 베팅할 확률" value={strongBets} set={setStrongBets} />
            <Pct label="약한 패로 베팅할 확률" value={weakBets} set={setWeakBets} />
          </div>
          <div className="calc-result" aria-live="polite">
            <p className="kicker">베팅을 본 뒤, 강한 패일 확률</p>
            <strong>
              {prior}% → {posterior}%
            </strong>
            <p>
              {weakBets >= strongBets
                ? "약한 패로도 그만큼 베팅하는 상대라면, 베팅은 강함의 신호가 아닙니다."
                : "강한 패로 더 자주 베팅하는 상대일수록, 베팅 하나가 레인지를 크게 좁힙니다."}
            </p>
            <p className="calc-sub">이 수치는 넣은 가정에서 나온 결과이며 실제 상대의 통계가 아닙니다. 가정은 쇼다운에서 확인한 사례로만 고칩니다.</p>
          </div>
        </div>
        <p className="note">
          <Ext href="https://arxiv.org/abs/1207.1411">Bayes&rsquo; Bluff · 상대 모델링 원문 ↗</Ext>
        </p>

        <div className="heading-row">
          <div>
            <p className="kicker">PLAYER STUDIES</p>
            <h3>네 가지 임시 가설과 대응 방향</h3>
            <p className="muted">포지션·스택·상대에 따라 한 선수의 플레이도 달라집니다. 라이브 HUD의 유형 라벨도 같은 전제에서 읽으세요.</p>
          </div>
        </div>
        <div className="split">
          {TYPES.map(([name, line, respond, record]) => (
            <article key={name}>
              <h4>{name}</h4>
              <p className="muted">{line}</p>
              <p>
                <b>대응 방향</b> · {respond}
              </p>
              <p>
                <b>기록할 것</b> · {record}
              </p>
            </article>
          ))}
        </div>

        <div className="feature">
          <span className="feature-mark" aria-hidden="true">
            ♠
          </span>
          <div>
            <p className="kicker">PRO CASE STUDY · DANIEL NEGREANU</p>
            <h3>스몰볼과 핸드 리딩</h3>
            <p>
              Negreanu의 2006년 기고는 작은 팟을 누적하는 접근과, 그 접근이 높은 핸드 리딩 능력을 요구한다는 점을 설명합니다. 당시 선수 본인의 전략 설명이며 지금 모든
              상황의 처방은 아닙니다. 작은 오픈이 남기는 선택권은 무엇인지, 콜이 많은 상대에게 밸류 크기는 어떻게 바뀌는지, 30BB에서도 딥스택 스몰볼의 장점이 유지되는지를
              질문으로 남깁니다.
            </p>
            <Ext className="feature-link" href="https://www.chron.com/sports/article/on-poker-small-ball-should-be-played-with-caution-1893829.php">
              선수 본인의 영문 기고 ↗
            </Ext>
          </div>
        </div>
        <p className="note">QPC는 대회 구역 안에서 전략 자료 사용을 금지합니다. 관찰 메모는 머리로 하고, 기록과 태깅은 대회장 밖에서 하세요.</p>
      </section>
    </main>
  );
}
