import Link from "next/link";

function Ext({ href, children, className }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener">
      {children}
    </a>
  );
}

// Hands a strategy note over to the matching 연구소 drill.
function LabLink({ href, children }) {
  return (
    <Link className="drill-link" href={href}>
      <span aria-hidden="true">♠</span> {children}
    </Link>
  );
}

export default function Strategy() {
  return (
    <div className="guide">
      <main className="wrap" id="main">
    <section id="strategy" className="panel">
      <header className="section-head">
        <div>
          <p className="kicker">02 / POKER PLAYBOOK</p>
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
          <Link className="feature-link" href="/lab/practice?pool=btn-steal&mode=drill">
            연구소에서 CO/BTN/SB 스틸 다섯 손 →
          </Link>
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
          <LabLink href="/lab/train">책 옆에 두고 스트리트별 훈련</LabLink>
        </article>
      </div>
      <p className="note">
        전략 노트는 사전 공부와 경기 후 복기용입니다. QPC는 대회 구역 내 전략 자료와 외부 조언 사용을 금지합니다.{" "}
        <Ext href="https://quadspoker.vn/news/player-guide-qpc-winter">공식 규정 ↗</Ext>
      </p>
    </section>
      </main>
    </div>
  );
}
