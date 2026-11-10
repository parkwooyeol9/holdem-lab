"use client";

import { useEffect, useState } from "react";
import EventSelector from "./EventSelector";

const TABS = [
  ["strategy", "01", "포커 전략"],
  ["qpc", "02", "QPC 2026 · 여행"],
  ["culture", "03", "베트남 문화"],
  ["lab", "04", <><em className="tab-long">Holdem </em>Lab</>]
];
const DEFAULT_PANEL = "qpc";
// In-panel anchors → the panel that owns them.
const ANCHOR_PANEL = { schedule: "qpc", stay: "qpc", study: "strategy", routine: "lab" };

function Ext({ href, children, className }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener">
      {children}
    </a>
  );
}

// Practice links into Holdem Lab (same site, different root layout → plain <a>).
function LabLink({ href, children }) {
  return (
    <a className="lab-inline" href={href}>
      <span aria-hidden="true">◆</span> {children}
    </a>
  );
}

export default function TripGuide() {
  const [panel, setPanel] = useState(DEFAULT_PANEL);

  useEffect(() => {
    const sync = () => {
      const target = location.hash.slice(1);
      const id = ANCHOR_PANEL[target] || target;
      setPanel(TABS.some(([key]) => key === id) ? id : DEFAULT_PANEL);
      if (target && target !== "main") {
        requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: "start" }));
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        본문 바로가기
      </a>
      <header className="top">
        <div className="wrap bar">
          <a className="brand" href="#qpc">
            <span aria-hidden="true">♠</span> VietnamPokerTrip
          </a>
          <div className="bar-right">
            <span className="edition">
              HÀ NỘI <i></i> 2026
            </span>
            <a className="lab-pill" href="/lab">
              <span aria-hidden="true">◆</span> <em className="tab-long">Holdem </em>Lab
            </a>
          </div>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">
              VIETNAM FIELD NOTES <span></span> 01
            </p>
            <h1 id="hero-title">
              하노이
              <br />
              포커 여행<span>.</span>
            </h1>
            <p>
              테이블에서의 전략, 대회장까지의 동선,
              <br />
              그리고 경기 사이에 만나는 베트남.
            </p>
            <div className="hero-actions">
              <a className="hero-link" href="#schedule">
                12월 15–19일 주요 경기 <span aria-hidden="true">↘</span>
              </a>
              <a className="hero-sub" href="#lab">
                출국 전 손 풀기 · Holdem Lab <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <figure className="hero-art">
            <img src="/hanoi.svg" width="850" height="440" alt="석양에 비친 호안끼엠 호수와 거북탑을 그린 일러스트" />
            <figcaption>
              <span>HỒ HOÀN KIẾM</span>
              <span>21°01′ N · 105°51′ E</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="navline">
        <nav className="wrap tabs" aria-label="여행 가이드">
          {TABS.map(([id, num, label]) => (
            <a key={id} href={`#${id}`} className={id === "lab" ? "tab-lab" : undefined} aria-current={panel === id ? "page" : undefined}>
              <span>{num}</span> {label}
            </a>
          ))}
        </nav>
      </div>

      <main className="wrap" id="main">
        {/* ───────────── 02 · QPC 2026 · 여행 ───────────── */}
        <section id="qpc" className="panel" hidden={panel !== "qpc"}>
          <header className="section-head">
            <div>
              <p className="kicker">02 / TOURNAMENT &amp; TRAVEL</p>
              <h2>QPC Winter 2026</h2>
              <p>12월 12–23일 시리즈 · 12월 20일 귀국 기준의 참가 계획</p>
            </div>
            <Ext className="outline" href="https://quadspoker.vn/news/player-guide-qpc-winter">
              공식 플레이어 가이드 ↗
            </Ext>
          </header>
          <div className="facts">
            <div>
              <small>대회장</small>
              <strong>Quads Hanoi Poker Club</strong>
              <p>Royal City R6동 2층 · 72A Nguyễn Trãi</p>
            </div>
            <div>
              <small>주력 후보</small>
              <strong>QPC Cup</strong>
              <p>22,000,000동 · 12월 18일 파이널</p>
            </div>
            <div>
              <small>일정 기준</small>
              <strong>하노이 현지 시각</strong>
              <p>한국보다 2시간 느림 · 11월 10일 확인</p>
            </div>
          </div>

          <div className="heading-row">
            <div>
              <p className="kicker">ARRIVAL</p>
              <h3>12월 14일 밤 vs 15일 아침</h3>
            </div>
          </div>
          <div className="split travel-options">
            <article>
              <span className="chip green">15일 오전 경기가 중요할 때</span>
              <h4>12월 14일 월요일 밤 출국</h4>
              <p>
                15일 11:00 Cup 1A에 맞추기 가장 좋은 선택. 15일 아침에 이동과 등록을 끝낼 수 있지만, 자정 전후 객실 입실과 공항 픽업 장소를 먼저 확인해야
                합니다.
              </p>
            </article>
            <article>
              <span className="chip">첫날 이동 부담을 줄일 때</span>
              <h4>12월 15일 화요일 아침 출국</h4>
              <p>
                15일 11:00 Cup 1A는 계획에서 빼고, 16일 10:30·17:00 또는 17일 10:30·17:00 플라이트를 택합니다. 16일 Golden Wings가 우선이라면 17일 Cup
                플라이트와 파이널 충돌을 고려하세요.
              </p>
            </article>
          </div>
          <p className="note">Kick Off 파이널은 15일 11:30입니다. 두 출국안 모두 예선을 놓치므로 최신 일정에서는 새 참가 후보에서 제외했습니다.</p>

          <div className="heading-row" id="schedule">
            <div>
              <p className="kicker">EVENT SELECTOR</p>
              <h3>주요 경기와 바이인 비교</h3>
              <p className="muted">
                총 바이인 기준. 보장 상금은 이벤트 전체 상금풀입니다. 입상·우승 상금과 수익률은 참가자 수 및 지급표에 따라 달라집니다.
              </p>
            </div>
            <Ext className="text-link" href="https://pokerdb.thehendonmob.com/festival.php?a=r&n=72429">
              전체 일정 ↗
            </Ext>
          </div>
          <EventSelector />

          <div className="split practical">
            <article>
              <h4>참가 시나리오</h4>
              <p>
                <b>낮은 지출</b> · Classic + Unity = 1,430만 동. <b>Cup 중심</b> · Cup 1회 + Unity = 2,860만 동. Cup 파이널 진출 시 18일 Classic과 겹칩니다.
              </p>
              <p>
                <b>조건부 하이롤러</b> · Golden Wings 1회는 Unity 약 8.3회분입니다. Cup 또는 Golden Wings를 우선 정하고, 19일 HR은 별도 예산과 지급 일정을
                확인한 뒤 검토합니다.
              </p>
            </article>
            <article>
              <h4>등록과 상금 확인</h4>
              <p>
                공식 가이드에 따르면 바이인은 VND로 받습니다. 등록에는 Quads 플레이어 카드가 필요합니다. 카드 발급 절차와 여권 원본 필요 여부는 사전에
                확인하세요. Best Stack Forward의 적용 대상과 여러 스택 진출 시 정산 방식도 등록 시 확인할 수 있습니다.
              </p>
              <p>
                Day 1 통과 상금은 바로 쓸 수 있는 현금으로 잡지 않았습니다. 19일 싱글데이도 자정을 넘길 수 있으므로, 귀국 전 지급 가능 여부와 지급
                수단·증빙을 먼저 확인하세요.
              </p>
            </article>
          </div>

          <div className="heading-row" id="stay">
            <div>
              <p className="kicker">ROYAL CITY / THANH XUÂN</p>
              <h3>숙소와 대회장 주변 동선</h3>
            </div>
            <Ext className="text-link" href="https://www.google.com/maps/search/?api=1&query=Quads%20Hanoi%20Poker%20Club%20R6%20Royal%20City">
              QPC 지도 ↗
            </Ext>
          </div>
          <div className="stay-table" role="region" aria-label="숙소 비교" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>숙소</th>
                  <th>이 여행에서의 장점</th>
                  <th>예약 전 확인</th>
                  <th>길찾기</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>
                    Aira Cự Lộc Apartment <span className="chip green">우선 검토</span>
                  </th>
                  <td>8 Ngõ 33 Phố Cự Lộc. 골목형 아파트로, QPC 중심 일정의 베이스 후보.</td>
                  <td>12월 요금·늦은 체크인, 객실별 주방, 차량 승하차 위치</td>
                  <td>
                    <Ext href="https://www.google.com/maps/dir/?api=1&origin=8%20Ngo%2033%20Cu%20Loc%20Hanoi&destination=Quads%20Hanoi%20Poker%20Club&travelmode=walking">
                      도보 ↗
                    </Ext>
                  </td>
                </tr>
                <tr>
                  <th>Anvi Boutique Hotel</th>
                  <td>23 Phố Cự Lộc, B8. 예약 페이지에 24시간 프런트가 안내돼 있어 늦은 도착의 비교 후보.</td>
                  <td>새벽 입실 보장, 예약일 요금, 리뷰 표본</td>
                  <td>
                    <Ext href="https://www.google.com/maps/dir/?api=1&origin=Anvi%20Boutique%20Hotel%20Hanoi&destination=Quads%20Hanoi%20Poker%20Club&travelmode=walking">
                      도보 ↗
                    </Ext>
                  </td>
                </tr>
                <tr>
                  <th>Hanoi Amore Hotel &amp; Travel</th>
                  <td>105 Vũ Tông Phan. 이전 여행안의 숙소 후보로 생활상권을 이용하기 편리.</td>
                  <td>R6 입구까지의 실제 동선, 헬스장·사우나·수영장 운영</td>
                  <td>
                    <Ext href="https://www.google.com/maps/dir/?api=1&origin=Hanoi%20Amore%20Hotel%20and%20Travel&destination=Quads%20Hanoi%20Poker%20Club&travelmode=walking">
                      도보 ↗
                    </Ext>
                  </td>
                </tr>
                <tr>
                  <th>Royal City 아파트</th>
                  <td>대회장과 같은 단지. 주최 측이 숙박 예약 지원을 안내.</td>
                  <td>배정 동·출입카드·야간 입실, R6까지 실내 동선</td>
                  <td>
                    <Ext href="https://quadspoker.vn/news/accommodation-booking-assistance-qpc-winter-2026">공식 안내 ↗</Ext>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="local-grid">
            <article>
              <span className="place-number">01</span>
              <h4>브레이크 중 식사</h4>
              <p>
                현지식은 Cự Lộc 또는 Vũ Tông Phan에서 퍼·분짜를 찾고, 브레이크에 동선이 짧아야 하면 Vincom Royal City B2를 이용하세요.{" "}
                <b>The Pizza Company</b> 공식 영업 안내는 10:00–22:00. 식사 후 R6 2층까지 돌아가는 시간을 남겨 두세요.
              </p>
              <Ext href="https://thepizzacompany.vn/en/stores">매장 안내 ↗</Ext>
            </article>
            <article>
              <span className="place-number">02</span>
              <h4>등록 전 커피</h4>
              <p>
                <b>Highlands Coffee Royal City</b>도 B2. 공식 안내 07:00–23:00. Cự Lộc 숙소에서 나올 때는 몰 출입구와 QPC 출입구를 각각 저장하세요.
              </p>
              <Ext href="https://www.highlandscoffee.com.vn/en/dealer/563/highlands-coffee-royalcity-hn.html">매장 안내 ↗</Ext>
            </article>
            <article>
              <span className="place-number">03</span>
              <h4>산책·마사지</h4>
              <p>
                짧게는 Royal City 광장. 시간이 넉넉하면 호안끼엠 호숫가 산책, 에그커피, 올드쿼터 마사지 후보를 묶을 수 있습니다. Serene Spa는 12월 요금과
                예약 가능 여부를 직접 확인하세요.
              </p>
              <Ext href="https://www.google.com/maps/search/?api=1&query=Serene%20Spa%20Hanoi%20Old%20Quarter">마사지 후보 지도 ↗</Ext>
            </article>
          </div>
          <details className="details">
            <summary>공항 이동과 다른 포커룸 후보</summary>
            <p>
              노이바이 국제공항(HAN) → Royal City는 GrabCar 또는 숙소 픽업으로 이동합니다. 기존 Amore 가이드의 차량 45–60분은 계획용 추정치이며, 입국심사와
              수하물 수령 시간은 별도입니다. 올드쿼터 → QPC 차량 25–45분도 혼잡에 따라 달라집니다. Cup 파이널과 겹치지 않는 날에는 Grand Loyal이나 VSOP를
              후보로 두고, 12월 편성과 운영 여부를 확인한 뒤 방문합니다.
            </p>
          </details>

          <aside className="lab-strip" aria-label="Holdem Lab 연결">
            <span className="lab-strip-mark" aria-hidden="true">◆</span>
            <div>
              <p className="kicker">BETWEEN FLIGHTS · HOLDEM LAB</p>
              <p>
                Cup 플라이트 사이 숙소에서는 대회장 밖에서 <b>핸드랩</b>으로 그날의 핸드를 복기하세요. 대회 구역 안에서는 전략 자료 사용이 금지됩니다.
              </p>
            </div>
            <a className="lab-strip-cta" href="/lab/hand-lab">
              핸드랩 열기 →
            </a>
          </aside>

          <p className="sources">
            일정과 숙소 출처 <Ext href="https://quadspoker.vn/news/qpc-winter-2026-multiday-events">Quads 공식 멀티데이</Ext>{" "}
            <Ext href="https://mypokertrips.com/series/qpc-winter-2026-2026-12-12">마이포커트립스</Ext>{" "}
            <Ext href="https://www.trip.com/hotels/hanoi-hotel-detail-135263313/aira-cu-loc-apartment/">Aira</Ext>{" "}
            <Ext href="https://www.booking.com/hotel/vn/anvi.html">Anvi</Ext>{" "}
            <Ext href="https://www.klook.com/vi/hotels/detail/202730-hanoi-amore-hotel--travel/">Amore</Ext>{" "}
            <Ext href="https://chatgpt.com/library?file_id=libfile_49c0cee080288191a9f3b4409097db1d&account_id=personal">기존 여행 가이드 · 11월 5일판</Ext>
          </p>
        </section>

        {/* ───────────── 01 · 포커 전략 ───────────── */}
        <section id="strategy" className="panel" hidden={panel !== "strategy"}>
          <header className="section-head">
            <div>
              <p className="kicker">01 / POKER PLAYBOOK</p>
              <h2>포커 전략 노트</h2>
              <p>라이브 MTT에서 검토한 의사결정과 온라인에서 검증할 가설</p>
            </div>
            <a className="outline" href="#study">
              공부할 책 ↓
            </a>
          </header>
          <div className="feature">
            <span className="feature-mark" aria-hidden="true">
              ♠
            </span>
            <div>
              <p className="kicker">LIVE TOURNAMENT</p>
              <h3>딥스택 초반에는 포지션과 팟 크기를 함께 봅니다.</h3>
              <p>
                버튼·컷오프에서 앞선 액션과 블라인드 성향을 보고 오픈을 조정합니다. 얼리 포지션과 멀티웨이 팟에서는 약한 원페어의 큰 콜을 줄이고, 깊은
                스택에서 넛 가능성이 높은 핸드를 우선합니다. 콜이 많은 테이블에서는 블러프 빈도를 낮추고 밸류를 더 받는 사이즈부터 검토합니다.
              </p>
              <a className="feature-lab" href="/lab/practice?pool=btn-steal&mode=drill">
                ◆ Holdem Lab에서 CO/BTN/SB 스틸 다섯 손 →
              </a>
            </div>
          </div>
          <div className="strategy-grid">
            <article>
              <p className="kicker">01 / EARLY LEVELS</p>
              <h3>타이트와 공격성의 기준</h3>
              <p>
                앞선 림퍼가 많고 콜이 잦다면 블러프성 아이솔레이션보다 좋은 핸드로 크게 올릴 때의 기대값을 먼저 봅니다. 한 명과 포지션을 가진 팟, 여러 명이
                남은 팟, 내가 먼저 액션하는 팟을 각각 복기하세요.
              </p>
              <p>
                <b>복기 질문</b> · 상대가 콜할 더 약한 핸드는 무엇이고, 턴에서 어떤 카드가 나오면 계속 베팅할 수 있었나?
              </p>
              <LabLink href="/lab/practice?pool=vs-open&mode=drill">오픈 상대 드릴</LabLink>
            </article>
            <article>
              <p className="kicker">02 / BUBBLE &amp; ICM</p>
              <h3>41명 남음 · 27명 입상</h3>
              <p>
                당시 13위이고 평균 40BB였다는 사례입니다. 14명이 더 탈락해야 입상하는 구간에서, 평균 스택과 내 스택만으로 압박 수준을 정하기는 어렵습니다.
                앞선 쇼트스택 수, 내가 커버하는 상대, 나를 커버하는 상대를 분리해 판단합니다.
              </p>
              <p>
                <b>복기 질문</b> · 같은 핸드라도 나를 커버하는 스택의 올인에 콜할 때와, 내가 커버하는 중간 스택에 먼저 레이즈할 때의 탈락 비용은 얼마나
                다른가?
              </p>
              <Ext href="https://blog.gtowizard.com/icm-basics/">ICM과 리스크 프리미엄 ↗</Ext>
              <LabLink href="/lab/hand-lab">핸드랩에서 재구성</LabLink>
            </article>
            <article>
              <p className="kicker">03 / ONLINE HYPOTHESIS</p>
              <h3>CoinPoker에서 BB 과다 폴드 검증</h3>
              <p>
                <b>가설</b> · BB가 BTN·SB 오픈에 기준보다 자주 폴드할 수 있습니다. BB가 오픈을 상대로 방어하는 상황과, 오픈 이후 다른 포지션에서 3벳이 나와
                BB가 콜드 디펜스를 결정하는 상황의 표본을 분리합니다. BB가 3벳을 하는 빈도 역시 별도로 기록합니다.
              </p>
              <p>
                포지션·유효 스택·오픈 크기·앤티·레이크가 비슷한 핸드끼리 폴드·콜·3벳 횟수와 전체 기회 수를 비교합니다. 표본이 쌓인 조합에서만 오픈 범위
                조정을 검토합니다.
              </p>
              <LabLink href="/lab/practice?pool=bb-defend&mode=drill">BB 디펜드 기준선</LabLink>
            </article>
          </div>

          <div className="heading-row" id="study">
            <div>
              <p className="kicker">READING LIST</p>
              <h3>두 권을 함께 읽는 순서</h3>
            </div>
          </div>
          <div className="split book-grid">
            <article>
              <span className="chip green">먼저 읽기 · 판단 원리</span>
              <h4>Why Alex Beats Bobbie at Poker</h4>
              <p className="muted">Duncan Palamourdas</p>
              <p>
                프로와 레크리에이션 플레이어가 같은 상황을 다르게 보는 이유를 설명합니다. 결과에 끌려가지 않는 복기, 상대의 밸류·블러프 구성, 관찰을 근거로
                한 전략 조정에 적합합니다.
              </p>
              <Ext href="https://www.pokerstars.com/poker/learn/news/duncan-palamourdas-explains-why-alex-beats-bobbie-at-poker-exclusive-excerpt/">공개 발췌 ↗</Ext>
              <Ext href="https://www.simonandschuster.net/books/Why-Alex-Beats-Bobbie-at-Poker/Duncan-Palamourdas/9781912862214">서지 ↗</Ext>
            </article>
            <article>
              <span className="chip">이어 읽기 · GTO 기준</span>
              <h4>Modern Poker Theory</h4>
              <p className="muted">Michael Acevedo</p>
              <p>
                노리밋 홀덤에서 게임이론과 솔버를 사용하는 법을 체계적으로 다룹니다. 프리플랍·포스트플랍에서 기준 전략을 세우고, 실제 테이블에서 관찰한 편차를
                복기하는 데 적합합니다.
              </p>
              <Ext href="https://www.simonandschuster.ca/books/Modern-Poker-Theory/Michael-Acevedo/9781909457898">출판사 안내 ↗</Ext>
              <LabLink href="/lab/learn">책 옆에 두고 스트리트별 학습</LabLink>
            </article>
          </div>
          <p className="note">
            전략 노트는 사전 공부와 경기 후 복기용입니다. QPC는 대회 구역 내 전략 자료와 외부 조언 사용을 금지합니다.{" "}
            <Ext href="https://quadspoker.vn/news/player-guide-qpc-winter">공식 규정 ↗</Ext>
          </p>
        </section>

        {/* ───────────── 03 · 베트남 문화 ───────────── */}
        <section id="culture" className="panel" hidden={panel !== "culture"}>
          <header className="section-head">
            <div>
              <p className="kicker">03 / CULTURAL FIELD NOTES</p>
              <h2>베트남을 읽는 세 지역</h2>
              <p>하노이에서 시작해 북부·중부·남부의 역사와 식문화를 연결합니다.</p>
            </div>
          </header>
          <div className="region-grid">
            <article>
              <p className="kicker">NORTH · 북부</p>
              <h3>하노이와 홍강 삼각주</h3>
              <p>
                11세기 리 왕조의 탕롱 황성은 홍강 삼각주 정치의 중심이었습니다. 호안끼엠 주변의 상업 골목, 수상인형극, 하노이식 쌀국수와 분짜를 함께 보면
                왕도와 생활 문화가 나란히 보입니다.
              </p>
              <Ext href="https://whc.unesco.org/en/list/1328/">탕롱 황성 · UNESCO ↗</Ext>
            </article>
            <article>
              <p className="kicker">CENTRAL · 중부</p>
              <h3>후에와 호이안</h3>
              <p>
                후에에는 응우옌 왕조의 궁정 유산이 남아 있고, 호이안에는 교역항의 흔적이 남아 있습니다. 후에의 분보후에, 호이안의 까오러우처럼 가까운
                지역에서도 도시마다 음식의 배경이 달라집니다.
              </p>
              <Ext href="https://whc.unesco.org/en/list/678/">후에 유적 · UNESCO ↗</Ext>
            </article>
            <article>
              <p className="kicker">SOUTH · 남부</p>
              <h3>호찌민시와 메콩 삼각주</h3>
              <p>
                호찌민시는 이주와 교역의 영향을 받은 대도시이고, 메콩 삼각주는 수로와 농업이 생활에 스며든 지역입니다. 남부의 껌땀이나 후띠우를 하노이의
                분짜·퍼와 비교하면 일상 식사의 차이를 느낄 수 있습니다.
              </p>
              <Ext href="https://vietnam.travel/things-to-do/vietnam-foodie-guide-region/">지역별 음식 · 베트남 관광청 ↗</Ext>
            </article>
          </div>
          <div className="heading-row">
            <div>
              <p className="kicker">IN BETWEEN FLIGHTS</p>
              <h3>경기 사이 하노이에서 할 일</h3>
            </div>
          </div>
          <div className="culture-list">
            <article>
              <span>01</span>
              <div>
                <h4>오전 산책 · 호안끼엠과 구시가지</h4>
                <p>
                  호숫가를 걸은 뒤 응우옌흐우후언 골목의 Cà phê Giảng에서 에그커피를 마셔보세요. 점심에는 분짜, 저녁에는 딜과 파를 곁들이는 생선 요리
                  짜까가 하노이식 선택입니다.
                </p>
                <Ext href="https://vietnam.travel/things-to-do/10-must-try-hanoi-dishes/">하노이 음식 안내 ↗</Ext>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h4>반나절 · 문묘와 수상인형극</h4>
                <p>
                  문묘에서 유교 교육의 흔적을 보고, 호안끼엠 인근 극장에서 물 위의 인형과 라이브 연주를 감상할 수 있습니다. 공연은 회차와 좌석을 확인하고 Cup
                  파이널이 없는 날에 잡는 편이 편합니다.
                </p>
                <Ext href="https://vietnam.travel/things-to-do/exploring-vietnam-vibrant-crafts/">수상인형극과 공예 ↗</Ext>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h4>저녁 · 성요셉 성당과 올드쿼터</h4>
                <p>
                  12월 18–19일 저녁 일정이 비면 성요셉 성당 주변과 올드쿼터를 산책 후보로 두세요. 성탄 장식, 공연, 풀파티는 방문일 편성을 확인해야 합니다.
                  확인한 InterContinental Westlake 크리스마스 마켓은 12월 5–6일이라 여행 기간 밖입니다.
                </p>
                <Ext href="https://hanoi.intercontinental.com/special-offers/christmas-market-winter-wonderland">마켓 공식 일정 ↗</Ext>
              </div>
            </article>
          </div>
          <div className="split practical">
            <article>
              <h4>Tết과 가족 문화</h4>
              <p>
                음력설 Tết에는 가족이 모여 조상을 기리고 새해의 행운을 빕니다. 조상 제단, 복을 빌며 건네는 빨간 봉투 <i>lì xì</i>, 찹쌀과 녹두를 넣은{" "}
                <i>bánh chưng</i>은 한국의 설과 비교해볼 만한 소재입니다.
              </p>
              <Ext href="https://vietnam.travel/things-to-do/tet-vietnam-lunar-new-year/">Tết 안내 ↗</Ext>
            </article>
            <article>
              <h4>예절과 짧은 베트남어</h4>
              <p>
                사원에서는 어깨와 무릎을 가리고 내부 안내를 따릅니다. 인물 사진은 먼저 허락을 구합니다. <b>Xin chào</b>는 안녕하세요, <b>Cảm ơn</b>은
                감사합니다, <b>Bao nhiêu tiền?</b>은 얼마인가요라는 뜻입니다.
              </p>
              <Ext href="https://vietnam.travel/things-to-do/vietnamese-etiquette-travellers/">여행 예절 ↗</Ext>
            </article>
          </div>
        </section>

        {/* ───────────── 04 · Holdem Lab (side) ───────────── */}
        <section id="lab" className="panel" hidden={panel !== "lab"}>
          <header className="section-head">
            <div>
              <p className="kicker">04 / TRAINING LAB</p>
              <h2>Holdem Lab</h2>
              <p>출국 전에는 솔버 기준으로 손을 풀고, 경기가 끝난 밤에는 핸드를 복기하는 사이드 연습장.</p>
            </div>
            <a className="outline" href="/lab">
              랩 열기 →
            </a>
          </header>

          <div className="lab-hero">
            <div>
              <p className="kicker">POKERBENCH · 6MAX GTO</p>
              <h3>전략 노트의 가설을, 솔버 노드로 확인합니다.</h3>
              <p>
                프리플랍은 GTOWizard, 포스트플랍은 WASM-Postflop 라벨을 쓰는 PokerBench 스팟을 다섯 손 단위로 풉니다. 100bb 캐시 기준이라 토너먼트의 ICM은
                반영되지 않으니, 버블 판단은 전략 노트와 함께 보세요.
              </p>
            </div>
            <div className="lab-hero-actions">
              <a className="hero-link" href="/lab/practice?pool=all&mode=drill">
                지금 다섯 손 <span aria-hidden="true">→</span>
              </a>
              <a className="lab-ghost" href="/lab/learn">
                스트리트별 학습
              </a>
            </div>
          </div>

          <div className="heading-row" id="routine">
            <div>
              <p className="kicker">D-34 → 12.20</p>
              <h3>하노이까지의 연습 루틴</h3>
            </div>
          </div>
          <ol className="routine">
            <li>
              <span>출국 전 · 주 3회</span>
              <h4>프리플랍 기준선</h4>
              <p>BB 디펜드와 CO/BTN/SB 스틸을 각각 다섯 손씩. 틀리거나 15초 넘게 고민한 손은 자동으로 복습 큐에 쌓입니다.</p>
              <a href="/lab/practice?pool=bb-defend&mode=drill">BB 디펜드 →</a>
            </li>
            <li>
              <span>출국 전날</span>
              <h4>챌린지로 마무리</h4>
              <p>목숨 3개 챌린지로 실수 패턴만 점검합니다. 동행이 있다면 라운지의 플레이 머니 테이블에서 가볍게 손을 맞춰 보세요.</p>
              <a href="/lab/practice?pool=all&mode=challenge">챌린지 →</a>
            </li>
            <li className="routine-stop">
              <span>12.15–19 · 대회장</span>
              <h4>랩은 열지 않습니다</h4>
              <p>QPC는 대회 구역 안에서 전략 자료와 외부 조언을 금지합니다. 라이브 HUD를 포함해 Holdem Lab은 대회장 밖에서만 사용하세요.</p>
              <Ext href="https://quadspoker.vn/news/player-guide-qpc-winter">공식 규정 ↗</Ext>
            </li>
            <li>
              <span>경기 후 · 숙소</span>
              <h4>핸드랩 복기</h4>
              <p>기억나는 핸드를 카드·포지션·액션까지 넣어 재구성하고, 전략 노트의 복기 질문에 답해 봅니다.</p>
              <a href="/lab/hand-lab">핸드랩 →</a>
            </li>
          </ol>

          <div className="lab-grid">
            <a href="/lab/learn">
              <span className="lab-num">01</span>
              <h4>배우기</h4>
              <p>프리플랍부터 리버까지 스트리트별 모듈. 포지션·3벳·보드 텍스처·사이징.</p>
            </a>
            <a href="/lab/practice?pool=all&mode=drill">
              <span className="lab-num">02</span>
              <h4>드릴</h4>
              <p>다섯 손 세션. 속도 XP와 콤보, 틀린 손은 스마트 복습으로.</p>
            </a>
            <a href="/lab/hand-lab">
              <span className="lab-num">03</span>
              <h4>핸드랩</h4>
              <p>정확한 카드와 멀티웨이 팟의 모든 플레이어를 넣어 프리플랍 액션을 직접 구성.</p>
            </a>
            <a href="/lab/live">
              <span className="lab-num">04</span>
              <h4>라이브 HUD</h4>
              <p>온라인 6맥스 테이블을 태깅하고 믹스를 받습니다. CoinPoker 가설 검증용.</p>
            </a>
            <a href="/lab/progress">
              <span className="lab-num">05</span>
              <h4>기록</h4>
              <p>결정 일지. 어떤 스트리트가 좋아졌고 무엇을 다시 풀지.</p>
            </a>
            <a href="/lab/lounge">
              <span className="lab-num">06</span>
              <h4>라운지</h4>
              <p>친구와 채팅·이모지가 있는 9맥스 캐주얼 테이블. 칩은 플레이 머니.</p>
            </a>
          </div>
          <p className="note">Holdem Lab의 진행 기록은 이 브라우저에만 저장됩니다. 플레이 머니만 사용하며 실제 금전 거래는 없습니다.</p>
        </section>
      </main>

      <footer>
        <div className="wrap footer-inner">
          <a className="brand" href="#qpc">
            <span aria-hidden="true">♠</span> VietnamPokerTrip
          </a>
          <p>
            Hà Nội · 2026년 11월 10일 기준 · <a href="/lab">Holdem Lab</a>
          </p>
        </div>
      </footer>
      <noscript>
        <p className="wrap">
          경기 필터와 탭을 이용하려면 자바스크립트를 활성화하세요. <a href="https://quadspoker.vn/news/player-guide-qpc-winter">QPC 공식 일정 보기</a>
        </p>
      </noscript>
    </>
  );
}
