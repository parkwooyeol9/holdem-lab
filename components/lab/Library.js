"use client";

import { useState } from "react";
import NoteNav, { Ext } from "./NoteNav";

const KINDS = ["전체", "학술 연구", "전문가 해설", "선수 기고", "프리프린트"];
const PAPERS = [
  ["학술 연구", "CFR · 2007", "불완전정보 게임에서 후회를 최소화하는 방법", "Regret Minimization in Games with Incomplete Information", "반복 학습으로 각 정보 집합의 행동을 개선한다. 두 명의 제로섬 게임에서 평균 전략을 평가하는 이론적 토대다.", "https://proceedings.neurips.cc/paper/2007/file/08d98638c6fcd194a4b1e6992063e944-Paper.pdf"],
  ["학술 연구", "DeepStack · 2017", "헤즈업 노리밋 포커의 전문가 수준 인공지능", "DeepStack: Expert-Level Artificial Intelligence in Heads-Up No-Limit Poker", "현재 보드뿐 아니라 핸드별 가치와 레인지를 고려해 전략을 다시 계산한다. 이 결과를 다인 토너먼트의 특정 핸드 차트로 그대로 옮길 수는 없다.", "https://arxiv.org/abs/1701.01724"],
  ["학술 연구", "ReBeL · 2020", "불완전정보 게임에서 강화학습과 탐색 결합하기", "Combining Deep Reinforcement Learning and Search for Imperfect-Information Games", "공개된 행동과 카드를 바탕으로 가능한 비공개 상태의 믿음을 갱신한다. 상대가 베팅했다는 사실 자체가 레인지를 바꾼다.", "https://arxiv.org/abs/2007.13544"],
  ["학술 연구", "Slepian et al. · 2013", "프로 선수의 팔 동작에서 핸드 강도를 읽을 수 있는가", "Quality of Professional Players’ Poker Hands Is Perceived Accurately From Arm Motions", "영상 관찰 실험에서는 팔 움직임에 핸드 강도에 관한 단서가 있었다. 특정 몸짓 하나로 블러프를 확정하는 규칙은 검증하지 않았다.", "https://www.columbia.edu/~ms4992/Pubs/2013_Slepian-Young-Rutchick-Ambady_Poker_PychSci.pdf"],
  ["학술 연구", "PokerBench · 2025", "LLM을 포커 플레이어로 훈련·평가하기 위한 벤치마크", "PokerBench: Training Large Language Models to Become Professional Poker Players", "솔버로 푼 프리플랍·포스트플랍 스팟 모음. 연구소의 훈련 스팟과 데이터 노트가 이 데이터셋에서 나온다. 6맥스 100bb 캐시 기준이고 라벨은 최빈 액션이다.", "https://arxiv.org/abs/2501.08328"],
  ["전문가 해설", "GTO Wizard · 실전 해설", "SB 단일 레이즈 팟의 플랍 전략", "Aggregate Flop Strategy: SB C-Betting in SRP", "30BB SB 대 BB 예시는 스택에 따라 프리플랍 레인지와 후속 보드 전략이 달라짐을 보여준다. 다른 포지션에 같은 빈도를 적용하면 안 된다.", "https://blog.gtowizard.com/aggregate-flop-strategy-sb-c-betting-in-srp/"],
  ["전문가 해설", "GTO Wizard · ICM", "ICM은 대회 초반 포스트플랍에도 영향을 준다", "How ICM Quietly Shapes Postflop Strategy From the Start", "상금 구조는 칩을 잃고 얻는 가치를 비대칭으로 만든다. 리스크 프리미엄은 대회와 상대 스택에 따라 달라진다.", "https://blog.gtowizard.com/how-icm-quietly-shapes-postflop-strategy-from-the-start/"],
  ["선수 기고", "Negreanu · 2006", "스몰볼을 신중하게 적용해야 하는 이유", "Small Ball Should Be Played With Caution", "작은 팟을 누적하는 접근에는 높은 핸드 리딩 능력이 필요하다고 설명한다. 당시 선수 본인의 전략 설명이며 현재 모든 상황의 처방은 아니다.", "https://www.chron.com/sports/article/on-poker-small-ball-should-be-played-with-caution-1893829.php"],
  ["학술 연구", "CRR · 1979", "간단한 이항 모형으로 옵션 가격 평가하기", "Option Pricing: A Simplified Approach", "미래 상태에서 현재로 거슬러 계산하는 방법이 포커의 계속 참여 가치에 영감을 준다. 포커 확률은 카드와 상대 행동으로 정한다.", "https://doi.org/10.1016/0304-405X(79)90015-1"],
  ["학술 연구", "Johanson et al. · 2013", "게임 상태를 요약하면 얼마나 정확도가 줄어드는가", "Evaluating State-Space Abstractions in Extensive-Form Games", "평균 승률만으로 요약하면 미래에 좋아지거나 나빠지는 분포를 놓칠 수 있다. 이항 트리의 판단 오차를 비교할 출발점이다.", "https://poker.cs.ualberta.ca/publications/AAMAS13-abstraction.pdf"],
  ["프리프린트", "Kim · 2025", "독립 칩 모형의 경험적 검증", "Empirical Validation of the Independent Chip Model", "토너먼트 칩을 순위·상금 가치로 바꾸는 ICM을 연구하는 후속 읽을거리다. 프리프린트이며 출판 심사 상태와 가정을 별도로 확인해야 한다.", "https://arxiv.org/abs/2506.00180"]
];

export default function Library({ go }) {
  const [kind, setKind] = useState("전체");
  const shown = PAPERS.filter((p) => kind === "전체" || p[0] === kind);

  return (
    <main className="wrap">
      <section className="panel">
        <NoteNav page="library" go={go} />
        <header className="section-head">
          <div>
            <p className="kicker">RESEARCH NOTE / READ THE ORIGINAL</p>
            <h2>영문에서 시작해, 한국어로 이해하기</h2>
            <p>제목 번역과 핵심 요약입니다. 논문 전체 번역이 아니며, 각 항목에 그 결과를 어디까지 적용할 수 없는지를 함께 적었습니다.</p>
          </div>
        </header>
        <div className="seg lib-filter" role="group" aria-label="근거 수준">
          <div>
            {KINDS.map((k) => (
              <button key={k} type="button" className={kind === k ? "on" : ""} aria-pressed={kind === k} onClick={() => setKind(k)}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <div className="split library">
          {shown.map(([type, source, title, original, body, href]) => (
            <article key={original}>
              <span className={"chip" + (type === "학술 연구" ? " green" : "")}>{type}</span> <span className="muted">{source}</span>
              <h4>{title}</h4>
              <p className="muted original" lang="en">
                {original}
              </p>
              <p>{body}</p>
              <Ext href={href}>영문 원문 · 출판 정보 ↗</Ext>
            </article>
          ))}
        </div>
        <div className="strip">
          <span className="strip-mark" aria-hidden="true">
            ♠
          </span>
          <div>
            <p className="kicker">RESEARCH PACKAGE</p>
            <p>영문 문헌 지도와 계속 참여 가치 모형의 전체 유도 과정을 Markdown으로 받을 수 있습니다.</p>
          </div>
          <a className="strip-cta" href="/research/01_Poker_Theory_Research_Map.md" download>
            문헌 지도 ↓
          </a>
          <a className="strip-cta" href="/research/02_Poker_Continuation_Value_Model.md" download>
            가치 모형 ↓
          </a>
        </div>
      </section>
    </main>
  );
}
