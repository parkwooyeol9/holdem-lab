"use client";

import { useMemo, useState } from "react";
import PAPERS from "@/public/research/06_Global_Poker_Research_Registry.json";
import NoteNav, { Ext } from "./NoteNav";

const VIEWS = { papers: ["논문 읽기"], map: ["연구 지도"], trust: ["신뢰도 읽는 법"] };
const TOPICS = ["전체", ...new Set(PAPERS.map((p) => p.topic))];
const STATUSES = ["전체", ...new Set(PAPERS.map((p) => p.status))];
const RECENT = PAPERS.filter((p) => p.year >= 2023).length;

const REGIONS = [
  ["미국", "CMU · MIT · UC Berkeley", "균형 계산, 강화학습, 상대 모델링, LLM 검증", "R01 · R02 · R05 · R06 · R10"],
  ["캐나다", "University of Alberta", "포커 AI와 성과 평가의 장기 연구 축", "R07 · R11 · R12"],
  ["네덜란드 · 영국", "TU Delft · Erasmus · VU · Nottingham", "상대 적응과 실력의 통계적 지속성", "R04 · R13"],
  ["중국", "Tsinghua · CAS/UCAS · HKUST(GZ)", "강화학습 정책과 도구를 쓰는 LLM", "R03 · R08"],
  ["체코 · 국제 협업", "Charles University · CTU · DeepMind · EquiLibre", "불완전정보 탐색과 범용 게임 학습", "R07 · R12"],
  ["미국 · 산업과 규제", "UNLV International Gaming Institute", "산업·규제·행동 데이터 연구. 전략 솔버 논문과 목적이 다르며 논문 수에 넣지 않았습니다.", "기관 안내"]
];
const TRUST = [
  ["출처", "학회·저널의 원문과 대학 저장소를 먼저 확인합니다. arXiv에 있다는 사실은 심사 통과를 뜻하지 않고, 반대로 arXiv에도 게재 완료 논문이 있습니다."],
  ["게임 조건", "Kuhn·Leduc는 작은 모형 게임입니다. 헤즈업/다인, 리밋/노리밋, 현금/토너먼트, 스택·앤티·상금 조건을 맞춰 읽습니다."],
  ["결과의 의미", "정답률, 특정 상대에 대한 승률, 최악의 상대에게 노출되는 정도(exploitability), 실제 상금 수익률은 서로 다른 지표입니다."],
  ["재현성과 불확실성", "코드·데이터·시드·표본 설계·신뢰구간을 확인합니다. 공개 링크가 있어도 직접 실행하지 않았다면 재현 성공이라고 쓰지 않습니다."],
  ["기관과 이해관계", "발표 당시 소속을 기록합니다. 산업 연구도 좋은 연구일 수 있지만 기업 협업·후원과 데이터 접근 제한을 따로 봅니다."],
  ["최근 논문의 한계", "최신 연구는 유망하지만 외부 재현과 후속 검증이 적을 수 있습니다. 오래된 기초 연구가 최신 주장을 읽는 기준선입니다."]
];
const PATHS = [
  ["토너먼트 실전", "R05 ICM 실증 → R11 성과 측정 → 토너먼트 심화 노트", "depth"],
  ["상대 공략", "R02 인간 모델 → R04 핸드 이력 활용 → 상대 읽기 노트", "reads"],
  ["연구소 데이터", "R06 PokerBench → R03 ToolPoker → 훈련 스팟에서 설명과 계산의 일치 확인", "train"],
  ["옵션 트리 아이디어", "R12 DeepStack → R09 ReBeL → 계속 참여 가치 노트", "continuation"]
];

function Pick({ label, value, set, options }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export default function World({ go }) {
  const [view, setView] = useState("papers");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("전체");
  const [topic, setTopic] = useState("전체");
  const [status, setStatus] = useState("전체");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PAPERS.filter(
      (p) =>
        (period === "전체" || p.year >= 2023) &&
        (topic === "전체" || p.topic === topic) &&
        (status === "전체" || p.status === status) &&
        (!q || [p.title, p.ko, p.authors, p.institution, p.summary, p.id].join(" ").toLowerCase().includes(q))
    ).sort((a, b) => b.year - a.year);
  }, [query, period, topic, status]);

  return (
    <main className="wrap">
      <section className="panel">
        <NoteNav page="world" go={go} />
        <header className="section-head">
          <div>
            <p className="kicker">RESEARCH NOTE / GLOBAL RESEARCH</p>
            <h2>세계의 연구를, 우리 테이블의 질문으로</h2>
            <p>MIT·CMU·Berkeley부터 유럽과 아시아까지. 최근 논문을 먼저 읽고, 무엇이 어디까지 검증됐는지 봅니다.</p>
          </div>
          <a className="outline" href="/research/06_Global_Poker_Research_KO.md" download>
            연구 노트 ↓
          </a>
        </header>
        <div className="facts">
          <div>
            <small>선별 논문 · 학위논문</small>
            <strong>{PAPERS.length}편</strong>
            <p>목적형 큐레이션이며 체계적 문헌고찰이 아닙니다</p>
          </div>
          <div>
            <small>2023–2026 연구</small>
            <strong>{RECENT}편</strong>
            <p>최신순 정렬</p>
          </div>
          <div>
            <small>출판 상태</small>
            <strong>{STATUSES.length - 1}가지로 구분</strong>
            <p>심사 논문 · 학위논문 · 프리프린트</p>
          </div>
        </div>
        <div className="seg lib-filter" role="tablist" aria-label="세계 연구">
          <div>
            {Object.entries(VIEWS).map(([id, [name]]) => (
              <button key={id} type="button" role="tab" aria-selected={view === id} className={view === id ? "on" : ""} onClick={() => setView(id)}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {view === "papers" && (
          <>
            <div className="controls">
              <label>
                검색
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="제목, 저자, 기관" />
              </label>
              <Pick label="기간" value={period} set={setPeriod} options={["전체", "최근 2023–2026"]} />
              <Pick label="주제" value={topic} set={setTopic} options={TOPICS} />
              <Pick label="출판 상태" value={status} set={setStatus} options={STATUSES} />
            </div>
            <p className="muted">{shown.length}편 · 최신순</p>
            <div className="split library">
              {shown.map((p) => (
                <article key={p.id}>
                  <span className={"chip" + (p.status === "심사 논문" ? " green" : "")}>{p.status}</span>{" "}
                  <span className="muted">
                    {p.id} · {p.year} · {p.topic}
                  </span>
                  <h4>{p.ko}</h4>
                  <p className="muted original" lang="en">
                    {p.title}
                  </p>
                  <p className="muted">
                    {p.institution} · {p.region} · {p.venue}
                  </p>
                  <p>{p.summary}</p>
                  <details className="paper-more">
                    <summary>방법 · 한계 · 실전 적용</summary>
                    <p>
                      <b>검증 범위</b> · {p.scope}
                    </p>
                    <p>
                      <b>방법</b> · {p.method}
                    </p>
                    <p>
                      <b>한계</b> · {p.limit}
                    </p>
                    <p>
                      <b>적용</b> · {p.application}
                    </p>
                    <p className="muted">
                      확인 범위: {p.review}. {p.assets}
                    </p>
                  </details>
                  <Ext href={p.url}>영문 원문 · 출판 기록 ↗</Ext>
                </article>
              ))}
            </div>
            {!shown.length && <p className="empty">이 조건에 해당하는 논문이 없습니다.</p>}
          </>
        )}

        {view === "map" && (
          <>
            <p className="note">국가보다 연구 질문을 먼저 고르세요. 기관은 논문 당시 소속이며, 명성이나 인용 수를 품질 점수로 바꾸지 않았습니다.</p>
            <div className="region-grid">
              {REGIONS.map(([region, schools, focus, ids]) => (
                <article key={region}>
                  <p className="kicker">{region}</p>
                  <h3>{schools}</h3>
                  <p>{focus}</p>
                  <p className="muted">{ids}</p>
                </article>
              ))}
            </div>
          </>
        )}

        {view === "trust" && (
          <>
            <p className="note">심사 여부와 실전 적용성은 별개의 축입니다.</p>
            <div className="culture-list">
              {TRUST.map(([name, body], i) => (
                <article key={name}>
                  <span>0{i + 1}</span>
                  <div>
                    <h4>{name}</h4>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="heading-row">
              <div>
                <p className="kicker">READING PATHS</p>
                <h3>추천 읽기 경로</h3>
              </div>
            </div>
            <div className="split">
              {PATHS.map(([name, path, page]) => (
                <article key={name}>
                  <h4>{name}</h4>
                  <p>{path}</p>
                  <button className="text-button" onClick={() => go(page)}>
                    이어서 보기 →
                  </button>
                </article>
              ))}
            </div>
            <p className="note">
              원문과 공식 서지에서 확인한 범위만 요약했습니다. ICM 실증 연구는 IEEE Conference on Games 2025 게재 논문이고, 검증 표본은 스냅샷 2,500개 · 33,478명입니다.
              후원·데이터·독립 재현이 확인되지 않은 항목은 미확인으로 남겼습니다.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
