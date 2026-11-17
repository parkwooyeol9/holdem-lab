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
- 2026-11-17 추가분: `/lab/depth` ICM 기본값 72.9% / −7.24, `/lab/rng` 1,000회 실험(29.6%, Wilson 26.9–32.5%)과 사이트 비교 표 6행, `/lab/world` 13편 표시, 세 페이지 모두 375px에서 가로 스크롤 없음.
- 로컬에서 `next dev` 실행 중에 `next build`를 돌리면 `.next`가 섞여 500이 납니다. 개발 서버를 다시 시작하면 해결됩니다(배포와 무관).
- **확인하지 못한 것:** Vercel 배포본, 라운지(PeerJS) 멀티 접속, `/culture`와 세션 요약 화면의 육안 점검.

## 4. Cursor가 할 일 (배포)

대상 주소: **https://eatplaypoker.vercel.app** (기존 Vercel 프로젝트, Production 브랜치 `main`)
작업 브랜치: `claude/poker-site-integration-lab-99dcb2` — **변경 사항은 커밋되지 않은 워킹트리 상태**입니다.

### 4-1. 커밋 & 푸시

```bash
git add -A
```

```bash
git commit -m "Unify the trip guide and Holdem Lab into one site with a research lab"
```

```bash
git push -u origin claude/poker-site-integration-lab-99dcb2
```

- `git add -A`에 `.claude/launch.json`(로컬 미리보기 설정)이 포함됩니다. 원치 않으면 `.gitignore`에 `.claude/`를 추가하세요.
- PR → `main` 머지 후 Vercel이 자동 배포합니다. 환경 변수는 없습니다. 빌드 `next build`, 설치 `npm install`.

### 4-2. 연구 에디션 03 반영 내용 (2026-11-17)

원본: https://poker-research-lab.savvyetf.chatgpt.site (Astra 작성). 아래 세 페이지를 추가했습니다.

| URL | 파일 | 내용 |
|---|---|---|
| `/lab/depth` | `components/lab/DeepTournament.js` | 평균 100BB→8BB 구간별 해설(단계·위치 선택), ICM 실험실 |
| `/lab/rng` | `components/lab/Rng.js` | 원리와 분포 · 깨지는 조건과 검정 · 사이트 비교 · 혼합전략 실험 |
| `/lab/world` | `components/lab/World.js` | 선별 논문 13편(검색·필터), 연구 지도, 신뢰도 읽는 법 |

- 논문 목록은 `public/research/06_Global_Poker_Research_Registry.json`을 그대로 import합니다. 원본 사이트가 갱신되면 이 파일만 교체하면 됩니다.
- `public/research/`에 Markdown 5개(01, 02, 04, 05, 06)와 JSON 1개가 있고 각 페이지에서 내려받기로 연결됩니다. 원본의 `03_Opus_5_5_Implementation_Handoff.md`는 올리지 않았습니다.
- ICM 계산은 `DeepTournament.js`의 `icm()`(Malmuth–Harville)이 직접 합니다. 원본과 일치 확인: 비대칭 40/30/20/10 · 상금 50/30/20/0 → 손익분기 72.9%, 승률 55%일 때 −7.24. 균등 → 65.2%, −3.92.
- 원본에 없는 추가: 스택 분포 '리더와 초단기(72/30/12/6)', 상금 '40/30/20/10', 스택별 상금 지분 표.
- 기초 문헌(`/lab/library`)의 ICM 논문 표기를 프리프린트 → IEEE CoG 2025 게재로 고쳤습니다.

### 4-3. 배포 후 스모크 테스트

- [ ] `/` 히어로와 주메뉴 4개, `/strategy`, `/culture`
- [ ] `/lab` 질문 카드 3개와 NEW 카드 3개 → 각 페이지로 이동
- [ ] `/lab/depth` ICM 실험실 기본값이 72.9% / −7.24
- [ ] `/lab/rng` 혼합전략 실험에서 '1,000회 추가' 후 빈도가 30% 근처
- [ ] `/lab/world` 13편 표시, 주제 필터 동작, 상세 펼침
- [ ] `/lab/tournament` `/lab/reads` `/lab/continuation` `/lab/library`
- [ ] `/lab/train` → 드릴 시작, `/lab/hand-lab` `/lab/live` `/lab/progress`
- [ ] `/lab/lounge` 두 브라우저로 PeerJS 연결 (로컬 미검증)
- [ ] `/#strategy` → `/strategy`, `/learn` → `/lab/train` 리다이렉트
- [ ] 모바일 375px 가로 스크롤 없음 (`/lab/rng` 사이트 비교 표는 표 안에서만 스크롤)

## 5. 주의

1. QPC 출처 줄에 있던 개인 ChatGPT 라이브러리 링크는 방문자가 열 수 없어 삭제했습니다.
2. 일정·바이인 기준일은 2026-11-10(하노이 시각)입니다. 경기는 `lib/trip-events.js`, 본문은 `components/trip/Travel.js`.
3. localStorage 키(`hl-progress-v2`, `hl-nick`, `hl-face`, `hl-lang`)는 그대로입니다.
4. RNG 사이트 비교는 2026-11-11 확인 기준의 공개 정보 요약이며 공정성 순위가 아닙니다. 문구를 바꿀 때 이 단서를 유지하세요.
5. 세계 연구의 2026년 논문 메타데이터(ICLR 2026, arXiv 2605.09150 등)는 원본 사이트 기재를 옮긴 것이며 이쪽에서 원문 대조를 하지 않았습니다.
6. 연구소 데이터 노트의 비율은 PokerBench 표본의 라벨 구성이며 레인지 전체 빈도가 아닙니다. 문구를 바꿀 때 이 단서를 유지하세요.
