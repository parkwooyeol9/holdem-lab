import Link from "next/link";
import EventSelector from "./EventSelector";
import LegacyHash from "./LegacyHash";

function Ext({ href, children, className }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener">
      {children}
    </a>
  );
}

export default function Travel() {
  return (
    <div className="guide">
      <LegacyHash />
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
            <Link className="hero-sub" href="/lab">
              출국 전 손 풀기 · 연구소 <span aria-hidden="true">→</span>
            </Link>
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

      <main className="wrap" id="main">
    <section id="qpc" className="panel">
      <header className="section-head">
        <div>
          <p className="kicker">01 / TOURNAMENT &amp; TRAVEL</p>
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

      <aside className="strip" aria-label="경기 후 복기">
          <span className="strip-mark" aria-hidden="true">♠</span>
          <div>
            <p className="kicker">BETWEEN FLIGHTS · 연구소</p>
            <p>
              플라이트가 끝난 밤, 숙소에서 그날의 핸드를 <b>핸드랩</b>에 넣어 복기하세요. 대회 구역 안에서는 전략 자료 사용이 금지됩니다.
            </p>
          </div>
          <Link className="strip-cta" href="/lab/hand-lab">
            핸드랩 열기 →
          </Link>
        </aside>

      <p className="sources">
        일정과 숙소 출처 <Ext href="https://quadspoker.vn/news/qpc-winter-2026-multiday-events">Quads 공식 멀티데이</Ext>{" "}
        <Ext href="https://mypokertrips.com/series/qpc-winter-2026-2026-12-12">마이포커트립스</Ext>{" "}
        <Ext href="https://www.trip.com/hotels/hanoi-hotel-detail-135263313/aira-cu-loc-apartment/">Aira</Ext>{" "}
        <Ext href="https://www.booking.com/hotel/vn/anvi.html">Anvi</Ext>{" "}
        <Ext href="https://www.klook.com/vi/hotels/detail/202730-hanoi-amore-hotel--travel/">Amore</Ext>
      </p>
    </section>
      </main>
    </div>
  );
}
