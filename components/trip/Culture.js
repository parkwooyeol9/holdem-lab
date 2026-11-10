function Ext({ href, children, className }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener">
      {children}
    </a>
  );
}

export default function Culture() {
  return (
    <div className="guide">
      <main className="wrap" id="main">
    <section id="culture" className="panel">
      <header className="section-head">
        <div>
          <p className="kicker">04 / CULTURAL FIELD NOTES</p>
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
      </main>
    </div>
  );
}
