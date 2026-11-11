# 인수인계서 · VietnamPokerTrip 통합 홈페이지

> 작성: Claude Code · 2026-11-10 (2026-11-11 통합 개편 반영)
> 대상: Cursor (GitHub 커밋 + Vercel 배포 담당)
> 배포 주소: **https://eatplaypoker.vercel.app** (`vietnampokertrip.vercel.app`은 404)

---

## 1. 현재 구조 (2026-11-11 통합 개편)

여행 가이드와 Holdem Lab을 **하나의 레이아웃·하나의 테마**로 합쳤습니다. 해시 탭 대신 실제 경로를 씁니다.

| URL | 내용 |
|---|---|
| `/` | 01 QPC · 여행 (히어로 포함) |
| `/strategy` | 02 포커 전략 노트 |
| `/lab` | 03 연구소 — 연구 노트·데이터 노트·도구·루틴 (종이 톤) |
| `/lab/tournament` `/lab/reads` `/lab/continuation` `/lab/library` | 연구 노트 (종이 톤): 유효 스택·30BB 3벳, 상대 읽기, 계속 참여 가치, 문헌. 원본은 poker-research-lab 사이트 |
| `/lab/train` `/lab/practice` `/lab/summary` | 훈련 허브(옛 홈+배우기 통합)·드릴·세션 요약 |
| `/lab/hand-lab` `/lab/live` `/lab/progress` `/lab/lounge` | 연구소 도구 (포레스트 톤) |
| `/culture` | 04 베트남 문화 |

- 옛 링크: `/#strategy` `/#culture` `/#lab` `/#study` `/#routine`은 `components/trip/LegacyHash.js`가, `/learn` `/lab/learn` 등은 `next.config.mjs` 리다이렉트가 새 경로로 보냅니다.
- QPC 규정(대회 구역 내 전략 자료 금지) 안내는 여행·전략·연구소 페이지에 유지했습니다.

## 2. 파일

```
app/
  layout.js               단일 루트 레이아웃: 헤더·푸터·메타데이터
  page.js strategy/ culture/ lab/[[...slug]]/
  styles/site.css         토큰(:root), 헤더·주메뉴·연구소 서브메뉴·푸터
  styles/guide.css        종이 톤 본문. 모든 규칙이 .guide 아래로 스코프됨
  styles/lab.css          연구소 도구. 모든 규칙이 .lab 아래로 스코프됨 (포레스트+골드)
components/
  site/SiteHeader.js SiteFooter.js
  trip/Travel.js Strategy.js Culture.js EventSelector.js LegacyHash.js
  lab/ResearchLab.js      연구소 랜딩 (/lab)
  lab/Tournament.js Reads.js Continuation.js Library.js NoteNav.js   연구 노트 페이지와 공통 보조 메뉴
  Train.js                훈련 허브 (/lab/train)
  App.js                  연구소 쉘: 서브메뉴 + 상태. 랜딩은 .guide, 도구는 .lab으로 감쌈
lib/sections.js           주메뉴 정의
lib/bench.js              BENCH_SIZES, labelSharesByOpener 추가 (연구소 데이터 노트용)
```

- 두 스타일시트가 각각 `.guide` / `.lab`으로 스코프되어 있어 한 레이아웃에서 섞이지 않습니다. 새 규칙도 같은 접두사를 붙이세요.
- 사이트 내부 이동은 모두 `next/link` 또는 `router.push`입니다.

## 3. 검증한 것 (로컬)

- `npx next build` 통과.
- 브라우저: `/`, `/strategy`, `/lab`과 도구 6개 화면, 375px 모바일에서 가로 스크롤 없음, 콘솔 에러 없음, `/#strategy` → `/strategy` 이동.
- **확인하지 못한 것:** Vercel 배포본, 라운지(PeerJS) 멀티 접속, `/culture`와 세션 요약 화면의 육안 점검.

## 4. Cursor가 할 일

작업 브랜치: `claude/poker-site-integration-lab-99dcb2`. Production은 이미 `main` → `https://eatplaypoker.vercel.app` 입니다. 환경 변수는 없습니다.

`.claude/`(로컬 개발 서버 설정)는 커밋하지 않습니다. `.next/`, `node_modules/`는 `.gitignore`에 있습니다.

배포 후 확인할 것:

- [ ] `/` → 하노이 히어로와 QPC 본문
- [ ] `/strategy`, `/lab`, `/culture`가 같은 헤더로 열린다
- [ ] `/#strategy` → `/strategy`, `/#lab` → `/lab`, `/#study` → `/strategy#study`
- [ ] 경기 "담기" → 합계·원화, Cup+Classic이면 겹침 경고
- [ ] `/lab/tournament` `/lab/reads` `/lab/continuation` `/lab/library` 연구 노트
- [ ] `/learn`과 `/lab/learn` → `/lab/train`
- [ ] 모바일에서 가로 스크롤 없음
- [ ] `/lab/lounge` PeerJS 연결 (기존 기능)

## 5. 주의

1. QPC 출처 줄에 있던 개인 ChatGPT 라이브러리 링크는 방문자가 열 수 없어 삭제했습니다.
2. 일정·바이인 기준일은 2026-11-10(하노이 시각)입니다. 경기는 `lib/trip-events.js`, 본문은 `components/trip/Travel.js`.
3. localStorage 키(`hl-progress-v2`, `hl-nick`, `hl-face`, `hl-lang`)는 그대로입니다.
4. 연구소 데이터 노트의 비율은 PokerBench 표본의 라벨 구성이며 레인지 전체 빈도가 아닙니다. 문구를 바꿀 때 이 단서를 유지하세요.
