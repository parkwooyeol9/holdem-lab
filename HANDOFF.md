# 인수인계서 · VietnamPokerTrip 통합 홈페이지

> 작성: Claude Code · 2026-11-10
> 대상: Cursor (GitHub 커밋 + Vercel 배포 담당)
> 목표 주소: **https://vietnampokertrip.vercel.app**

---

## 1. 무엇을 했나

기존 ChatGPT 사이트(`vietnampokertrip.savvyetf.chatgpt.site`)의 **하노이 포커 여행 가이드를 메인(`/`)** 으로,
이 저장소의 **Holdem Lab을 사이드(`/lab`)** 로 붙여 하나의 Next.js 사이트로 합쳤습니다.

- `/` — VietnamPokerTrip 가이드. 원본의 HTML/CSS/JS를 React로 옮겼고, 문구·데이터·링크는 원본 그대로입니다.
  - 탭: `01 포커 전략` · `02 QPC 2026 · 여행`(기본) · `03 베트남 문화` · **`04 Holdem Lab`(신규)**
  - 해시 링크 유지: `#strategy` `#qpc` `#culture` `#lab` `#schedule` `#stay` `#study` `#routine`
  - 경기 선택기(필터·정렬·환율·예산 합계·충돌 경고)는 원본 `app.js` 로직을 React state로 옮겼습니다.
- `/lab/*` — 기존 Holdem Lab 앱 그대로. 경로만 `/lab` 아래로 이동했습니다.
- 두 영역 연결 지점
  - 메인 상단 바의 `◆ Holdem Lab` 버튼, 히어로의 "출국 전 손 풀기 · Holdem Lab →" 링크, 푸터 링크
  - 전략 노트 각 카드 하단에 해당 드릴로 바로 가는 링크 (예: BB 과다 폴드 가설 → `/lab/practice?pool=bb-defend&mode=drill`)
  - QPC 탭 하단: 경기 후 핸드랩 복기 안내 스트립
  - `04 Holdem Lab` 탭: 소개, "하노이까지의 연습 루틴", 모듈 6개 카드
  - Holdem Lab 사이드바 하단의 `♠ VietnamPokerTrip` 카드와, 모바일 헤더의 `♠` 버튼으로 메인 복귀
- **QPC 규정 반영:** 대회 구역 안에서 전략 자료·외부 조언 사용이 금지되어 있어서, Lab 탭과 QPC 탭에 "대회장 밖에서만 사용"이라고 안내했습니다.

## 2. 구조

두 영역의 전역 CSS가 서로 충돌하기 때문에(Lab은 `body`·`nav`·`aside`·`h1`을 전역 스타일로 지정함) Next.js **route group 두 개에 루트 레이아웃을 각각** 두었습니다.
`/` ↔ `/lab` 사이 이동은 전체 페이지 로드로 처리되고 CSS가 섞이지 않습니다. 그래서 두 영역 사이의 링크는 `next/link`가 아니라 일반 `<a>`를 써야 합니다.

```
app/
  (trip)/                 ← 메인: VietnamPokerTrip
    layout.js             메타데이터·OG(vietnampokertrip.vercel.app), <html>/<body>
    page.js               → components/trip/TripGuide
    trip.css              원본 style.css + 하단에 "Holdem Lab integration" 블록
  (lab)/                  ← 사이드: Holdem Lab
    layout.js             (기존 app/layout.js에서 이동, 제목만 변경)
    globals.css           (기존, 맨 아래 .trip-back / .trip-link 스타일 추가)
    live.css lounge.css practice.css   (기존 그대로 이동)
    lab/[[...slug]]/page.js            (기존 app/[[...slug]]/page.js 이동)
components/
  trip/TripGuide.js       메인 페이지 전체 (탭·패널·콘텐츠)
  trip/EventSelector.js   QPC 경기 선택기 (client component)
  App.js                  Lab 쉘. 메인으로 돌아가는 링크 2곳 추가
lib/
  routes.js               LAB_BASE="/lab", 모든 Lab 경로에 /lab 접두
  trip-events.js          QPC 경기 데이터 + 충돌 규칙 (원본 app.js에서 분리)
public/
  hanoi.svg favicon.svg   원본 사이트 에셋
next.config.mjs           옛 경로 리다이렉트: /learn → /lab/learn 등 7개
HANDOFF.md                이 문서
```

### URL 맵

| URL | 내용 |
|---|---|
| `/` | VietnamPokerTrip (정적 프리렌더) |
| `/#lab` | Holdem Lab 소개 탭 |
| `/lab` | Holdem Lab 홈 |
| `/lab/learn` `/lab/practice` `/lab/hand-lab` `/lab/live` `/lab/progress` `/lab/lounge` `/lab/summary` | Lab 각 페이지 |
| `/learn` 등 옛 Lab 경로 | `/lab/...`로 307 리다이렉트 |

## 3. 검증한 것 (로컬)

- `npx next build` 통과. `/`는 Static, `/lab/[[...slug]]`는 Dynamic.
- 브라우저에서 확인한 항목
  - 데스크톱: 히어로·탭 4개·QPC·전략·Lab 탭 렌더링
  - 경기 선택기: Cup + Classic을 담으면 29,700,000동 · 약 1,633,500원과 "Cup 파이널과 Classic 시작이 겹칩니다." 경고가 나옴
  - `/lab/practice?pool=bb-defend&mode=drill` 진입 시 BB 디펜드 드릴이 바로 시작됨
  - `/learn` → `/lab/learn` 리다이렉트
  - 모바일 375px: 가로 스크롤 없음, 탭 4개가 한 줄에 들어감, Lab 모바일 헤더에 복귀 버튼 표시
  - 콘솔 에러 없음
- **확인하지 못한 것:** 실제 Vercel 배포본, 라운지(PeerJS) 멀티 접속.

## 4. Cursor가 할 일

### 4-1. 커밋 & 푸시

현재 작업 브랜치: `claude/vietnam-poker-trip-homepage-92d836` (커밋 전 상태, 변경 사항은 워킹트리에 있음)

```bash
git add -A
git commit -m "Make VietnamPokerTrip the home page and move Holdem Lab to /lab"
git push -u origin claude/vietnam-poker-trip-homepage-92d836
```

- 파일 이동은 `git mv`로 이미 스테이징해 두었습니다(rename으로 기록됨). `git add -A`로 신규 파일까지 포함하면 됩니다.
- `.next/`, `node_modules/`는 `.gitignore`에 들어 있습니다.
- PR → `main` 머지. 또는 바로 main에 반영해도 됩니다. Vercel Production이 `main`을 바라보도록 해 주세요.

### 4-2. Vercel 연결 → `vietnampokertrip.vercel.app`

Vercel의 `*.vercel.app` 기본 도메인은 **프로젝트 이름**으로 정해지고, 항상 소문자입니다.

**A. 새 프로젝트로 만드는 경우**
1. Vercel → Add New → Project → GitHub 저장소 `parkwooyeol9/holdem-lab` Import
2. **Project Name: `vietnampokertrip`** (대소문자 무관하게 URL은 `vietnampokertrip.vercel.app`)
3. Framework Preset: Next.js (자동 감지). Build `next build`, Output 기본값, Install `npm install`
4. 환경 변수: **없음**
5. Production Branch: `main`

**B. 기존 Holdem Lab Vercel 프로젝트를 재사용하는 경우**
- Settings → General → Project Name을 `vietnampokertrip`으로 변경하거나,
- Settings → Domains → `vietnampokertrip.vercel.app` 추가

> `vietnampokertrip.vercel.app`을 이미 다른 계정이 쓰고 있으면 Vercel이 다른 이름(`vietnampokertrip-xxxx.vercel.app`)을 붙입니다. 그때는 사용자에게 알리고, `layout.js` 두 곳의 `metadataBase`·`openGraph.url`을 실제 주소로 바꿔 주세요.

### 4-3. 배포 후 스모크 테스트

- [ ] `https://vietnampokertrip.vercel.app/` → 하노이 히어로, QPC 탭이 기본
- [ ] `/#lab`, `/#study`, `/#schedule` 해시 진입 시 해당 탭과 위치로 이동
- [ ] 경기 "담기" 체크 → 합계와 원화 환산 표시
- [ ] 상단 `◆ Holdem Lab` → `/lab` (어두운 Lab UI), 사이드바 `♠ VietnamPokerTrip` → `/`
- [ ] `/learn` → `/lab/learn` 리다이렉트
- [ ] 모바일에서 가로 스크롤 없음
- [ ] `/lab/lounge`에서 두 브라우저로 접속해 PeerJS 연결 확인 (기존 기능, 경로만 바뀜)

## 5. 주의 · 결정이 필요한 것

1. **비공개 출처 링크:** QPC 탭 맨 아래 출처 줄의 "기존 여행 가이드 · 11월 5일판"은 원본 사이트에 있던 `chatgpt.com/library?...account_id=personal` 링크를 그대로 옮긴 것입니다. 개인 ChatGPT 라이브러리 링크라서 일반 방문자는 열 수 없습니다. 공개 사이트에 남길지 사용자에게 확인하고, 필요하면 `components/trip/TripGuide.js`의 sources 문단에서 지워 주세요.
2. **데이터 기준일:** 일정·바이인·영업시간은 원본 기준(2026-11-10 하노이 시각 확인)입니다. 바꿀 때는 `lib/trip-events.js`(경기)와 `TripGuide.js`(본문)를 수정하면 됩니다.
3. **링크 규칙:** `/` ↔ `/lab` 사이 링크는 루트 레이아웃이 달라서 일반 `<a href>`로 둬야 합니다. Lab 내부 이동은 기존처럼 `router.push(pathFromPage(...))`를 쓰고, 경로는 `lib/routes.js`의 `LAB_BASE`가 관리합니다.
4. **localStorage 키**(`hl-progress-v2`, `hl-nick`, `hl-face`, 언어)는 바꾸지 않았습니다. 같은 도메인이면 기록이 유지되지만, 도메인이 바뀌면(이전 Vercel 주소 → 새 주소) 브라우저 기록은 새로 시작됩니다.
5. 빌드 중 나오는 "multiple lockfiles" 경고는 로컬 git worktree 환경 때문에 생긴 것이고, Vercel에서는 나오지 않습니다.
