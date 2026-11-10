"use client";

import { BENCH_META, BENCH_SIZES, labelSharesByOpener } from "@/lib/bench";
import { MODULES, SOURCE, SPOTS, pct } from "@/lib/spots";

const OPENERS = ["UTG", "HJ", "CO", "BTN", "SB"];
const BB_ROWS = labelSharesByOpener("vsOpen", "BB", OPENERS);
const PARTS = [
  ["Fold", "폴드", "fold"],
  ["Call", "콜", "call"],
  ["3-bet", "3벳", "raise"]
];
const count = (n) => n.toLocaleString("ko-KR");

const BENCH = [
  ["bb-defend", "BB 디펜드"],
  ["btn-steal", "CO/BTN/SB 스틸"],
  ["vs-open", "오픈 상대"],
  ["3bet", "3벳 팟"]
];

const TOOLS = [
  ["train", "훈련", "필터와 모드를 골라 다섯 손. 틀리거나 15초 넘게 걸린 손은 복습 큐로 갑니다."],
  ["handlab", "핸드랩", "카드·포지션·액션을 넣어 실전 핸드를 재구성하고 레인지로 복기합니다."],
  ["live", "라이브 HUD", "온라인 6맥스 테이블을 태깅하고 상대 성향이 반영된 믹스를 받습니다."],
  ["progress", "기록", "결정 일지와 스트리트별 숙련도. 무엇을 다시 풀지 보여 줍니다."],
  ["lounge", "라운지", "동행과 앉는 9맥스 캐주얼 테이블. 채팅과 이모지, 칩은 플레이 머니."]
];

function Ext({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener">
      {children}
    </a>
  );
}

// 연구소 landing: what the lab measures, how, and where to practise it.
export default function ResearchLab({ start, go, answered, correct, reviewQueue }) {
  const preflop = MODULES.find((m) => m.id === "preflop")?.count || 0;
  const first = BB_ROWS[0];
  const last = BB_ROWS[BB_ROWS.length - 1];

  return (
    <main className="wrap">
      <section className="panel">
        <header className="section-head">
          <div>
            <p className="kicker">03 / HOLDEM RESEARCH LAB</p>
            <h2>홀덤 연구소</h2>
            <p>전략 노트의 가설을 솔버 데이터로 확인하고, 다섯 손씩 훈련하고, 경기가 끝난 밤에 복기합니다.</p>
          </div>
          <button className="outline" onClick={() => go("train")}>
            훈련 시작 →
          </button>
        </header>

        <div className="facts">
          <div>
            <small>기준 데이터</small>
            <strong>
              {SOURCE.name} · {count(SPOTS.length)} 스팟
            </strong>
            <p>
              프리플랍 {count(preflop)} · 포스트플랍 {count(SPOTS.length - preflop)}
            </p>
          </div>
          <div>
            <small>게임</small>
            <strong>6맥스 · 100bb 캐시</strong>
            <p>
              프리플랍 {SOURCE.preflop} · 포스트플랍 {SOURCE.postflop}
            </p>
          </div>
          <div>
            <small>내 기록</small>
            <strong>{answered ? `솔버 일치 ${pct(correct, answered)}%` : "아직 기록 없음"}</strong>
            <p>{answered ? `${count(answered)}손 중 ${count(correct)}손 · 복습 대기 ${reviewQueue.length}손` : "첫 다섯 손을 풀면 여기에 쌓입니다"}</p>
          </div>
        </div>

        <div className="feature bench">
          <span className="feature-mark" aria-hidden="true">
            ♠
          </span>
          <div>
            <p className="kicker">TODAY&rsquo;S BENCH</p>
            <h3>가설 하나, 다섯 손.</h3>
            <p>전략 노트에서 세운 질문을 골라 솔버가 가장 자주 고른 액션과 내 결정을 맞춰 봅니다. 한 세션은 다섯 손이고, 결과는 기록과 복습 큐에 남습니다.</p>
            <div className="bench-actions">
              {BENCH.map(([pool, label]) => (
                <button key={pool} onClick={() => start(pool, "drill")}>
                  {label}
                </button>
              ))}
              {reviewQueue.length ? (
                <button className="ghost" onClick={() => start("all", "review", reviewQueue)}>
                  스마트 복습 {reviewQueue.length}손
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="heading-row">
          <div>
            <p className="kicker">RESEARCH NOTES</p>
            <h3>무엇을, 어떻게 재는가</h3>
            <p className="muted">연구소의 도구가 실제로 계산하는 것과, 그 숫자가 말하지 않는 것.</p>
          </div>
        </div>
        <div className="strategy-grid">
          <article>
            <p className="kicker">01 / BASELINE</p>
            <h3>기준선은 솔버의 최빈 액션</h3>
            <p>
              훈련 스팟은 공개 데이터셋 PokerBench에서 가져옵니다. 각 스팟의 정답은 솔버가 그 노드에서 <b>가장 자주 고른 액션</b>이고, 같은 계열의 다른 사이즈는
              &lsquo;근접&rsquo;으로 채점합니다.
            </p>
            <Ext href={SOURCE.url}>데이터셋 ↗</Ext>
            <Ext href={SOURCE.paper}>논문 ↗</Ext>
          </article>
          <article>
            <p className="kicker">02 / METHOD</p>
            <h3>라벨을 빈도로 바꾸기</h3>
            <p>
              프리플랍 첫 결정 {count(BENCH_META.n)}건을 네 층으로 집계합니다. 핸드 묶음 {count(BENCH_SIZES.bucket)}칸, 오프너별 묶음 {count(BENCH_SIZES.vsBucket)}칸, 정확한
              핸드 {count(BENCH_SIZES.exact)}칸, 핸드×오프너 {count(BENCH_SIZES.opener)}칸.
            </p>
            <p>
              표본이 n개인 칸은 <b>n ÷ (n + k)</b>만큼만 믿고 나머지는 위 층에서 빌립니다. 표본이 적은 핸드가 한두 건의 라벨에 휘둘리지 않게 하는 장치이고, 라이브
              HUD의 믹스가 이 값입니다.
            </p>
          </article>
          <article>
            <p className="kicker">03 / LIMITS</p>
            <h3>이 숫자가 말하지 않는 것</h3>
            <p>
              라벨은 최빈 액션 하나라서 솔버의 혼합 전략과 EV 차이는 담기지 않습니다. 기준은 100bb 캐시라 토너먼트의 ICM과 스택 깊이 변화도 빠져 있습니다.
            </p>
            <p>버블과 쇼트스택 판단은 전략 노트의 복기 질문으로, 기준선 감각은 여기서 따로 다룹니다.</p>
          </article>
        </div>

        <div className="heading-row" id="data">
          <div>
            <p className="kicker">DATA NOTE · BB DEFENSE</p>
            <h3>BB는 누구의 오픈에 얼마나 버티나</h3>
            <p className="muted">오프너 자리별로 BB가 받은 정답 라벨의 구성. 전략 노트의 &lsquo;BB 과다 폴드&rsquo; 가설을 볼 때의 기준선입니다.</p>
          </div>
          <ul className="dist-legend" aria-hidden="true">
            {PARTS.map(([, label, cls]) => (
              <li key={cls} className={cls}>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="dist" role="table" aria-label="오프너별 BB 라벨 구성">
          {BB_ROWS.map((row) => (
            <div className="dist-row" role="row" key={row.vs}>
              <b role="rowheader">{row.vs} 오픈</b>
              <div className="dist-bar" role="cell">
                {PARTS.map(([key, label, cls]) => {
                  const share = Math.round(row.shares[key] || 0);
                  return (
                    <i key={key} className={cls} style={{ flexGrow: Math.max(share, 1) }}>
                      {share >= 8 ? `${share}%` : ""}
                      <span className="sr-only">
                        {label} {share}%
                      </span>
                    </i>
                  );
                })}
              </div>
              <small role="cell">{count(row.n)}건</small>
            </div>
          ))}
        </div>
        <p className="note">
          오프너가 블라인드에 가까워질수록 폴드 라벨이 줄어듭니다({first.vs} {Math.round(first.shares.Fold || 0)}% → {last.vs} {Math.round(last.shares.Fold || 0)}%).
          다만 데이터셋이 핸드를 고르게 뽑은 것이 아니어서, 이 값은 표본 속 라벨 구성이지 레인지 전체의 폴드 빈도가 아닙니다. 방향만 읽고, 실제 기준선은 손으로
          확인하세요.{" "}
          <button className="text-button" onClick={() => start("bb-defend", "drill")}>
            BB 디펜드 다섯 손 →
          </button>
        </p>

        <div className="heading-row">
          <div>
            <p className="kicker">LAB BENCH</p>
            <h3>실험 도구</h3>
          </div>
        </div>
        <div className="tool-grid">
          {TOOLS.map(([id, name, body], i) => (
            <button key={id} onClick={() => go(id)}>
              <span className="place-number">0{i + 1}</span>
              <h4>{name}</h4>
              <p>{body}</p>
            </button>
          ))}
        </div>

        <div className="heading-row" id="routine">
          <div>
            <p className="kicker">BEFORE 12.14 → AFTER 12.19</p>
            <h3>하노이까지의 연습 루틴</h3>
          </div>
        </div>
        <ol className="routine">
          <li>
            <span>출국 전 · 주 3회</span>
            <h4>프리플랍 기준선</h4>
            <p>BB 디펜드와 CO/BTN/SB 스틸을 각각 다섯 손씩. 틀리거나 오래 고민한 손은 복습 큐에 쌓입니다.</p>
            <button className="text-button" onClick={() => start("bb-defend", "drill")}>
              BB 디펜드 →
            </button>
          </li>
          <li>
            <span>출국 전날</span>
            <h4>챌린지로 마무리</h4>
            <p>목숨 3개 챌린지로 실수 패턴만 점검합니다. 동행이 있다면 라운지에서 가볍게 손을 맞춰 보세요.</p>
            <button className="text-button" onClick={() => start("all", "challenge")}>
              챌린지 →
            </button>
          </li>
          <li className="routine-stop">
            <span>12.15–19 · 대회장</span>
            <h4>연구소는 닫아 둡니다</h4>
            <p>QPC는 대회 구역 안에서 전략 자료와 외부 조언을 금지합니다. 라이브 HUD를 포함해 모든 도구는 대회장 밖에서만 쓰세요.</p>
            <Ext href="https://quadspoker.vn/news/player-guide-qpc-winter">공식 규정 ↗</Ext>
          </li>
          <li>
            <span>경기 후 · 숙소</span>
            <h4>핸드랩 복기</h4>
            <p>기억나는 핸드를 카드·포지션·액션까지 넣어 재구성하고, 전략 노트의 복기 질문에 답해 봅니다.</p>
            <button className="text-button" onClick={() => go("handlab")}>
              핸드랩 →
            </button>
          </li>
        </ol>
        <p className="note">연구소의 진행 기록은 이 브라우저에만 저장됩니다. 플레이 머니만 사용하며 실제 금전 거래는 없습니다.</p>
      </section>
    </main>
  );
}
