"use client";

import { useState } from "react";
import NoteNav, { Ext } from "./NoteNav";

const VIEWS = { basics: ["원리와 분포"], attack: ["깨지는 조건과 검정"], sites: ["사이트 비교"], lab: ["혼합전략 실험"] };

const DISTS = [
  ["균등", "U < p이면 행동 A를 실행", "카드 순열은 52!개에 대한 이산 균등. 숫자 히스토그램이 고르다는 것과 덱 순열이 공정하다는 것은 따로 검토합니다."],
  ["초기하", "남은 N장 중 성공 K장, n장을 비복원 추출", "P(X=k)=C(K,k)·C(N−K,n−k)/C(N,n). 한 덱 안의 추출은 독립이 아닙니다."],
  ["이항", "독립이고 확률 p가 같은 n회 행동의 빈도", "승률이 핸드마다 다르면 이항 대신 Poisson-binomial. 무승부가 있으면 0·0.5·1 보상을 따로 모델링합니다."],
  ["기하", "고정 p에서 다음 성공까지의 대기", "기억이 없습니다. 과거의 패배가 다음 핸드의 성공 확률을 높이지 않습니다."],
  ["정규 · χ²", "빈도 오차와 적합도 검정의 근사", "희귀 사건과 작은 기대도수에서 부정확합니다. 로열 플러시 같은 사건은 정확 검정이나 Poisson 근사를 봅니다."],
  ["베타", "고정 행동확률 θ의 베이지안 추정", "Beta(a,b) 사전 + 성공 k/표본 n → Beta(a+k, b+n−k). 관측 상황이 서로 교환 가능해야 합니다."]
];
const FAILS = [
  ["작은 시드 공간", "실제 불확실성이 낮고, 후보를 가려낼 출력이 관측될 때", "출력 비트 수가 아니라 시드의 최소 엔트로피를 평가합니다."],
  ["비암호학적 PRNG", "충분한 원시 출력으로 선형 상태를 재구성할 수 있는 설계", "LCG·Mersenne Twister 같은 시뮬레이션용 생성기를 비밀 카드에 쓰지 않습니다. 공개 카드 몇 장은 원시 출력 전체와 다릅니다."],
  ["시드·상태 재사용과 노출", "같은 상태 반복, 예측 가능한 재시딩, 로그·사이드채널 누출", "재시딩, 상태 분리, 접근 통제, 출력 후 상태 보안을 검토합니다."],
  ["매핑·셔플 편향", "난수원은 좋아도 잘못된 mod 연산이나 스왑 범위를 쓸 때", "작은 덱의 전 순열 검증, 거절 표본추출, 구현 감사."],
  ["분산 시드 프로토콜", "마지막 참여자가 남의 시드를 본 뒤 고르거나 불리할 때 중단할 수 있을 때", "사전 커밋, 공개 순서, 중단 처리, nonce 고유성, 검증 코드와 배포의 일치를 점검합니다."]
];
const STEPS = [
  ["가설과 표본을 미리 고정", "‘모든 딜의 특정 위치 수트 비율’처럼 명확한 사건을 고르고, 쇼다운까지 간 핸드만 모으는 선택 편향을 피합니다."],
  ["조건부 귀무분포를 구성", "알려진 카드·블로커·비복원 추출을 반영합니다. 서로 다른 올인 승률 pᵢ의 합은 E[X]=Σpᵢ, 독립이면 Var(X)=Σpᵢ(1−pᵢ)입니다."],
  ["검정을 역할별로 분리", "빈도는 χ², 순서 의존성은 runs·자기상관, 그리고 조건부 잔차를 봅니다. 이산 카드 번호에 연속 KS 임계값을 그대로 쓰지 않습니다."],
  ["다중 비교 보정", "독립인 검정 20개를 α=5%로 돌리면 하나 이상 거짓 양성이 나올 확률은 1−0.95²⁰ ≈ 64.2%입니다."],
  ["효과 크기와 검정력", "p=0.50과 0.51의 차이를 양측 5%, 검정력 80%로 잡으려면 단순 독립 근사로도 약 19,600회가 필요합니다."]
];
const SITES = [
  ["PokerStars", "https://www.pokerstars.com/security/", "광자 기반 양자 난수원이라는 공식 설명", "핸드 전 셔플 후 덱 고정", "GLI 검증을 공식 페이지에 명시", "현재 운영 코드·DRBG 이름·시드 길이·정수 매핑은 확인한 문서에 없음."],
  ["GGPoker", "https://download.good-game-service.com/assets/certificate/bmm.pdf", "공개 요약 보고서상 Software RNG", "셔플·PRNG 내부 구성 미공개", "BMM 요약 보고서 · Poker Game RNG v2.0.0 · 2022-05-20", "2022년 특정 버전의 평가 요약. 현재 전체 서비스와의 코드 동일성은 확인 못함."],
  ["CoinPoker", "https://coinpoker.com/rng/", "기반 난수원 상세 미공개", "2026-07-25 갱신 페이지에 Fisher–Yates 명시", "인증 RNG라고 설명하나 시험기관·대상 버전은 특정 못함", "공식 GitHub의 분산 셔플 코드와 현행 서버 배포의 일치는 미확인."],
  ["partypoker", "https://www.partypoker.com/en/p/SystemFairness", "기반 난수 생성기 상세 미공개", "공개 문서는 결과 분포 감사 중심", "iTech Labs · 2026년 8월 로그 분석 보고서", "분포 검정은 출력 진단. 예측 불가능성이나 현행 소스 전체를 증명하지 않음."],
  ["888poker", "https://www.888.com/security-and-privacy/fair-play/", "그룹 Fair Play 페이지에 RNG 사용 설명", "포커 전용 구현 미공개", "그룹 차원의 반복 시험 설명", "포커 전용 알고리즘·인증기관·버전을 특정할 수 없음."],
  ["4Poker", "https://4poker.com/shuffle", "엔트로피 소스 5개 이상과 SHA-256 해시 키라고 설명", "세부 매핑·셔플 구현 미공개", "공식 기술 페이지에 eCOGRA 코드·결과 검증 명시", "SHA-256 언급만으로 특정 표준 구현을 추정할 수 없음."]
];
const REFS = [
  ["R1", "결정론적 난수 비트 생성기 권고 · NIST SP 800-90A", "https://csrc.nist.gov/pubs/sp/800/90/a/r1/final"],
  ["R2", "난수 생성용 엔트로피 소스 권고 · NIST SP 800-90B", "https://csrc.nist.gov/pubs/sp/800/90/b/final"],
  ["R3", "NIST 난수 검정 지침 개정 결정 · 2022", "https://www.nist.gov/news-events/news/2022/04/decision-revise-nist-sp-800-22-rev-1a"],
  ["R4", "포커 카드 분석 2026년 8월 · iTech Labs", "https://scmedia.partypoker.com/$-$/6eefdfed972f4a94a7ec36a29ce943bc.pdf"],
  ["R5", "CoinPoker 분산 난수 라이브러리 · GitHub", "https://github.com/CoinPokerOfficial/poker-decentralized-rng"],
  ["R6", "불완전정보 게임에서의 후회 최소화 · NeurIPS 2007", "https://proceedings.neurips.cc/paper/2007/file/08d98638c6fcd194a4b1e6992063e944-Paper.pdf"]
];

const RAISE = 30;
// Unbiased 0…99 from 32 random bits: reject the top sliver that would favour low values.
function draw100() {
  const limit = Math.floor(0x100000000 / 100) * 100;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % 100;
}
function wilson(k, n) {
  const z = 1.96;
  const p = k / n;
  const mid = p + (z * z) / (2 * n);
  const half = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  const d = 1 + (z * z) / n;
  return [(mid - half) / d, (mid + half) / d];
}

function MixLab() {
  const [bins, setBins] = useState(() => Array(10).fill(0));
  const [last, setLast] = useState(null);
  const n = bins.reduce((a, b) => a + b, 0);
  const raises = bins[0] + bins[1] + bins[2];
  const run = (count) => {
    const next = bins.slice();
    let value = last;
    for (let i = 0; i < count; i++) {
      value = draw100();
      next[Math.floor(value / 10)] += 1;
    }
    setBins(next);
    setLast(value);
  };
  const ci = n ? wilson(raises, n) : null;
  const peak = Math.max(1, ...bins);

  return (
    <>
      <div className="calc">
        <div className="calc-inputs">
          <p className="kicker">레이즈 30% · 콜 70%를 실행하는 난수</p>
          <p className="muted">브라우저의 암호 난수에서 32비트를 받아 거절 표본추출로 0…99에 고르게 매핑합니다. 0…29는 레이즈, 30…99는 콜입니다.</p>
          <div className="bench-row">
            <button className="outline" onClick={() => run(1)}>
              1회 추출
            </button>
            <button className="outline" onClick={() => run(1000)}>
              1,000회 추가
            </button>
            <button
              className="text-button"
              onClick={() => {
                setBins(Array(10).fill(0));
                setLast(null);
              }}
            >
              초기화
            </button>
          </div>
          <div className="histo" aria-label="난수 구간별 횟수">
            {bins.map((count, i) => (
              <div key={i} className={i < 3 ? "raise" : ""}>
                <i style={{ height: `${(count / peak) * 100}%` }} />
                <small>{i * 10}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="calc-result" aria-live="polite">
          <p className="kicker">실현된 레이즈 빈도</p>
          <strong>{n ? `${((raises / n) * 100).toFixed(1)}%` : "—"}</strong>
          <p>
            {last == null
              ? "아직 추출하지 않았습니다."
              : `최근 난수 ${last} → ${last < RAISE ? "레이즈" : "콜"}. 표본 ${n.toLocaleString("ko-KR")}회 중 레이즈 ${raises.toLocaleString("ko-KR")}회.`}
          </p>
          <p>{ci ? `95% Wilson 구간 ${(ci[0] * 100).toFixed(1)}% – ${(ci[1] * 100).toFixed(1)}%` : "표본이 쌓이면 구간이 좁아지는 것을 볼 수 있습니다."}</p>
          <p className="calc-sub">
            난수는 이미 정한 빈도를 실행할 뿐입니다. 30%가 옳은 빈도인지는 레인지와 행동별 EV가 정합니다. 구간을 계속 보다가 유리할 때 멈추면 95%라는 해석이 깨집니다.
          </p>
        </div>
      </div>
      <p className="note">실제 핸드의 최적 정책이나 사이트 서버의 난수를 재현하는 도구가 아닙니다. 대회 구역 안에서는 난수 도구를 포함한 어떤 보조 자료도 쓰지 않습니다.</p>
    </>
  );
}

export default function Rng({ go }) {
  const [view, setView] = useState("basics");

  return (
    <main className="wrap">
      <section className="panel">
        <NoteNav page="rng" go={go} />
        <header className="section-head">
          <div>
            <p className="kicker">RESEARCH NOTE / STATISTICS &amp; CRYPTOGRAPHY</p>
            <h2>난수를 이해하고, 예측 가능성을 구분하다</h2>
            <p>카드를 섞는 난수, 내 혼합전략을 실행하는 난수, 연구용 시뮬레이션 난수는 목적이 다릅니다.</p>
          </div>
          <a className="outline" href="/research/05_RNG_Study_KO.md" download>
            연구 전문 ↓
          </a>
        </header>
        <div className="seg lib-filter" role="tablist" aria-label="RNG 연구">
          <div>
            {Object.entries(VIEWS).map(([id, [name]]) => (
              <button key={id} type="button" role="tab" aria-selected={view === id} className={view === id ? "on" : ""} onClick={() => setView(id)}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {view === "basics" && (
          <>
            <div className="local-grid">
              <article>
                <h4>카드 셔플 RNG</h4>
                <p>비밀 덱 순서를 만드는 운영자의 난수. 균등성·독립성·예측 저항성·운영 보안이 모두 요구됩니다.</p>
              </article>
              <article>
                <h4>혼합전략 RNG</h4>
                <p>‘레이즈 30%’처럼 이미 정한 정책을 실행하는 도구. 전략의 질은 레인지와 행동 EV가 결정합니다.</p>
              </article>
              <article>
                <h4>시뮬레이션 PRNG</h4>
                <p>연구에서는 같은 시드로 결과를 재현할 수 있어야 합니다. 이 재현성과 비밀 카드의 예측 저항성은 다른 목적입니다.</p>
              </article>
            </div>
            <div className="feature">
              <span className="feature-mark" aria-hidden="true">
                ♠
              </span>
              <div>
                <p className="kicker">시드에서 카드까지 네 층위</p>
                <h3>물리 엔트로피 → 상태·DRBG → 균등 정수 매핑 → Fisher–Yates 순열</h3>
                <p>
                  PRNG는 내부 상태로 결정론적 수열을 만듭니다. CSPRNG는 상태를 모르는 관찰자가 다음 출력을 예측하기 어렵게 설계되고, TRNG는 물리 잡음을 쓰되 편향 제거와 상태
                  점검이 필요합니다. SHA-256 같은 해시 이름만으로는 전체 설계를 알 수 없습니다.
                </p>
              </div>
            </div>
            <div className="split">
              <article>
                <span className="chip green">직접 유도</span>
                <h4>52!와 226비트</h4>
                <p>
                  log₂(52!) ≈ 225.58입니다. b비트 시드 하나로 덱을 결정하면 가능한 덱은 최대 2ᵇ개뿐입니다. 반대로 상태가 많다는 사실만으로 예측 저항성이 증명되지는 않습니다.
                </p>
                <h4>Fisher–Yates의 균등성</h4>
                <p>
                  i=51부터 1까지 매번 j를 0…i에서 고르게 뽑아 교환하면 각 순열의 확률은 1/52!입니다. 매 단계 j를 0…51 전체에서 고르는 흔한 실수는 이 증명을 만족하지 않습니다.
                </p>
              </article>
              <article>
                <span className="chip">직접 유도</span>
                <h4>Modulo bias · 8비트 예시</h4>
                <p>X가 0…255에서 균등할 때 X mod 52는 균등하지 않습니다. 0…47은 각각 5/256, 48…51은 각각 4/256입니다.</p>
                <p>X &lt; 208만 받아 나머지를 취하면 모든 값이 정확히 4번씩 나옵니다. 버리는 비율은 48/256 = 18.75%이고, 큰 비트폭에서도 원리는 같습니다.</p>
                <h4>아웃 9장, 두 장을 더 볼 때</h4>
                <p>적어도 한 번 맞을 확률은 1 − C(38,2)/C(47,2) ≈ 34.97%. 카드 사건의 확률이며 핸드 승률과 같지는 않습니다.</p>
              </article>
            </div>
            <div className="heading-row">
              <div>
                <p className="kicker">DISTRIBUTIONS</p>
                <h3>포커에서 만나는 분포와 함정</h3>
              </div>
            </div>
            <div className="stay-table" role="region" aria-label="분포" tabIndex={0}>
              <table className="notes">
                <thead>
                  <tr>
                    <th>분포</th>
                    <th>포커에서의 역할</th>
                    <th>성립 조건과 함정</th>
                  </tr>
                </thead>
                <tbody>
                  {DISTS.map(([name, role, trap]) => (
                    <tr key={name}>
                      <th>{name}</th>
                      <td>{role}</td>
                      <td>{trap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === "attack" && (
          <>
            <div className="heading-row">
              <div>
                <p className="kicker">FAILURE CONDITIONS</p>
                <h3>무엇을 알면 예측이 가능한가</h3>
              </div>
            </div>
            <div className="stay-table" role="region" aria-label="예측이 가능해지는 조건" tabIndex={0}>
              <table className="notes">
                <thead>
                  <tr>
                    <th>문제</th>
                    <th>예측이 가능해지는 조건</th>
                    <th>검토와 대응</th>
                  </tr>
                </thead>
                <tbody>
                  {FAILS.map(([name, when, fix]) => (
                    <tr key={name}>
                      <th>{name}</th>
                      <td>{when}</td>
                      <td>{fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              일반적인 실패 조건이며, 비교한 사이트에 이런 취약점이 있다는 증거는 확인하지 않았습니다. 정상 구현된 암호 난수는 공개된 과거 카드만으로 다음 카드를 예측하기
              어렵게 설계됩니다. 긴 연패나 주기 관찰만으로는 깨는 방법을 얻을 수 없습니다.
            </p>
            <div className="split">
              <article>
                <span className="chip green">테이블에서의 의미</span>
                <h4>상대의 난수가 아니라 빈도를 읽는다</h4>
                <p>
                  상대의 난수 숫자를 맞히는 것이 아니라 행동 빈도와 사용 조건을 추정합니다. 같은 상황에서 블러프가 과다하면 콜의, 과소하면 폴드의 기대값이 달라집니다.
                  포지션·스택·보드·사이즈가 다른 데이터를 섞으면 추정이 왜곡됩니다.
                </p>
              </article>
              <article>
                <span className="chip">해석 주의</span>
                <h4>p값은 공정할 확률이 아닙니다</h4>
                <p>
                  기각 실패는 ‘이 표본·이 검정에서 그 편차를 검출하지 못했다’는 뜻입니다. NIST는 통계 검정을 암호 난수의 보안 평가로 쓰는 데 한계가 있다고 명시합니다. 유출된
                  정상 난수열은 분포 검정을 통과하면서도 예측될 수 있습니다.
                </p>
              </article>
            </div>
            <div className="heading-row">
              <div>
                <p className="kicker">TEST PROTOCOL</p>
                <h3>‘조작 같다’를 검정으로 바꾸는 순서</h3>
              </div>
            </div>
            <div className="culture-list">
              {STEPS.map(([name, body], i) => (
                <article key={name}>
                  <span>0{i + 1}</span>
                  <div>
                    <h4>{name}</h4>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
            <details className="details">
              <summary>Provably fair를 볼 때 확인할 것</summary>
              <p>
                서버 시드의 해시를 먼저 고정하고 이후 클라이언트 시드와 nonce로 결과를 재계산하는 구조는 사후 변경을 점검하는 데 도움이 됩니다. 하지만 시드의 품질, 운영자가
                유리한 커밋만 고르는 행위, 선택적 중단, 딜 이전의 비밀 유지까지 자동으로 증명하지는 않습니다. 일반 프로토콜 설명이며 특정 사이트의 현재 구현으로 단정하지
                않습니다.
              </p>
            </details>
          </>
        )}

        {view === "sites" && (
          <>
            <p className="note">
              확인일 2026-11-11. 공식 기술 설명, 시험 보고서, 공식 코드 저장소에서 <b>공개 정보의 구체성</b>을 비교했습니다. 공정성 점수나 안전성 순위가 아니며, 특정 사이트
              이용을 권하는 내용도 아닙니다.
            </p>
            <div className="stay-table" role="region" aria-label="사이트 비교" tabIndex={0}>
              <table className="wide">
                <thead>
                  <tr>
                    <th>사이트</th>
                    <th>난수원 · 생성</th>
                    <th>셔플</th>
                    <th>검증 근거</th>
                    <th>확인 한계</th>
                  </tr>
                </thead>
                <tbody>
                  {SITES.map(([name, href, source, shuffle, proof, limit]) => (
                    <tr key={name}>
                      <th>
                        <Ext href={href}>{name} ↗</Ext>
                      </th>
                      <td>{source}</td>
                      <td>{shuffle}</td>
                      <td>{proof}</td>
                      <td>{limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="local-grid">
              <article>
                <h4>알고리즘과 시험기관</h4>
                <p>BMM·GLI·iTech·eCOGRA는 검증 근거의 이름입니다. 그것만으로 난수 생성기가 어떤 계열인지 알 수 없습니다.</p>
              </article>
              <article>
                <h4>기술 설명과 현행 배포</h4>
                <p>공개 저장소가 있다는 것과 현재 서비스가 그 코드를 실행한다는 것은 별개입니다. 배포 버전의 일치는 따로 증명해야 합니다.</p>
              </article>
              <article>
                <h4>인증 시점과 범위</h4>
                <p>2022년의 버전 평가와 2026년 8월의 로그 분석은 시점도 시험 범위도 다릅니다. 같은 ‘인증’이라는 말로 합치지 않습니다.</p>
              </article>
            </div>
          </>
        )}

        {view === "lab" && <MixLab />}

        <div className="heading-row">
          <div>
            <p className="kicker">SOURCES</p>
            <h3>영문 원문</h3>
          </div>
        </div>
        <p className="sources src-list">
          {REFS.map(([id, name, href]) => (
            <Ext key={id} href={href}>
              {id} · {name} ↗
            </Ext>
          ))}
        </p>
      </section>
    </main>
  );
}
