# 세계 포커 연구 큐레이션

검토일: 2026-11-12. 최신 연구 우선. 체계적 문헌고찰이 아닌 목적형 선별 목록이다. 기관 명성은 신뢰도 점수가 아니다. 요약은 연구소의 한국어 해설이며 전문 번역이 아니다. 원문을 재배포하지 않고 공식 링크를 제공한다.

## 검토 기준

기관·심사 여부·게임 조건·검증 방식·재현 자료·실전 전이 한계를 별도로 기록한다. 코드 공개는 재현 성공과 다르다. 연구자 소속은 논문 당시 기준이다. 최근 연구는 2023년 이후로 정의한다.

## R01 · 포커 AI 학습법을 다시 비교하면? (2026)

Reevaluating Policy Gradient Methods for Imperfect-Information Games

- **저자:** Max Rudolph 외 8명
- **기관:** MIT · CMU · UC Berkeley · UT Austin · NYU
- **지역:** 미국
- **출판:** ICLR 2026
- **상태:** 심사 논문
- **게임 범위:** 불완전정보 게임 벤치마크
- **쉬운 요약:** 복잡한 전용 알고리즘이 항상 이기는 것은 아니다. 적절히 조정한 일반 정책경사 학습법도 비교 대상들에 경쟁력 있는 결과를 보였다.
- **방법과 근거:** 5개 대형 게임의 정확한 exploitability 계산과 7,000회 이상 학습 실험을 사용했다.
- **한계:** 실험 대상과 구현에 관한 결과다. 모든 CFR 변형이나 실제 다인 토너먼트에서 PPO가 우월하다는 증명은 아니다.
- **연구소 적용 아이디어:** 우리 모델도 이름의 유명세보다 동일 예산·동일 게임에서 비교해야 한다.
- **확인 수준:** 원문 PDF의 서지·초록·방법 개요 확인
- **재현 자료:** 원문에 IIG-RL-Benchmark와 exp-a-spiel 코드 링크 명시; 재실행 미수행
- **원문:** https://www.mit.edu/~gfarina/2026/iclr26_reevaluating/iclr26_reevaluating.pdf

## R02 · 사람처럼 실수하는 연습 상대 만들기 (2026)

On Creating Human Models in Poker with Deep Learning and Regularized Search

- **저자:** Nathan Chen; 지도 Gabriele Farina
- **기관:** MIT
- **지역:** 미국
- **출판:** MIT EECS · February 2026
- **상태:** 학위논문
- **게임 범위:** 인간 정책 모방과 정규화 탐색
- **쉬운 요약:** 완벽한 상대만으로 연습하면 실제 사람의 실수를 놓칠 수 있다. 인간 행동을 모방하는 모델과 탐색을 결합해 인간다운 행동과 전략 강도의 균형을 연구한다.
- **방법과 근거:** 행동 복제 및 정규화 탐색. 저장소 초록은 인간 유사성과 정책 강도 사이의 절충을 보고한다.
- **한계:** 대학 학위논문이며 저널 심사 논문으로 분류하지 않는다. 이번에는 저장소 초록 수준 검토로 수치 재현성을 평가하지 않았다.
- **연구소 적용 아이디어:** 타이트·루스 등 훈련 상대를 만들 때 모방 정확도와 전략 강도를 따로 평가한다.
- **확인 수준:** MIT 공식 서지·초록 확인; 전문 정독 미완료
- **재현 자료:** 학위논문 PDF 공개; 코드 확인 미완료
- **원문:** https://dspace.mit.edu/handle/1721.1/171485

## R03 · 말을 잘하는 AI와 포커를 잘하는 AI는 같은가? (2026)

How Far Are LLMs from Professional Poker Players? Revisiting Game-Theoretic Reasoning with Agentic Tool Use

- **저자:** Minhua Lin 외
- **기관:** Penn State · HKUST(GZ) · Tsinghua · Amazon · Microsoft
- **지역:** 미국·중국
- **출판:** ICLR 2026 (Microsoft Research 기록)
- **상태:** 심사 논문
- **게임 범위:** Kuhn · Leduc · Limit Hold’em 등
- **쉬운 요약:** LLM은 그럴듯한 설명을 해도 행동이 설명과 다를 수 있다. ToolPoker는 솔버 도구를 연결하여 판단과 설명을 함께 개선하는 접근이다.
- **방법과 근거:** 원문은 행동 결과와 추론을 함께 평가하고 행동복제·강화학습·도구 결합을 비교한다.
- **한계:** 논문 제목의 professional은 실제 세계 챔피언 상대 승리를 뜻하지 않는다. 시험 게임과 도구 의존성을 확인해야 한다.
- **연구소 적용 아이디어:** 연구소의 한국어 설명과 실제 EV 계산을 분리하고 일치 여부를 검사한다.
- **확인 수준:** 원문 소속·초록·평가 범위 및 MS Research 학회 표기 대조
- **재현 자료:** 코드·데이터 공개 여부는 이번 검토에서 확인하지 못함
- **원문:** https://arxiv.org/html/2602.00528v1

## R04 · 지난 핸드를 기억해 상대 약점을 공략하기 (2026)

AlphaExploitem: Going Beyond the Nash Equilibrium in Poker by Learning to Exploit Suboptimal Play

- **저자:** Vlad Murgoci · Matthijs Spaan · Yaniv Oren
- **기관:** Delft University of Technology
- **지역:** 네덜란드
- **출판:** arXiv:2605.09150v1
- **상태:** 프리프린트
- **게임 범위:** Kuhn poker · Leduc Hold’em
- **쉬운 요약:** 현재 핸드만 보지 않고 이전 핸드 기록을 읽는 Transformer를 추가한다. 학습 때 만나지 않은 약한 상대에게도 추가 이익을 얻었다고 보고한다.
- **방법과 근거:** 핸드 기록을 가린 비교 실험과 학습 내·외 상대 평가를 수행한다.
- **한계:** 작은 모형 게임에서의 결과다. 실제 6인 NLHE, 30BB 3벳 팟, 라이브 텔에 대한 검증은 아니다. Nash 상대 성과 유지가 전 상대에 대한 안전성 증명도 아니다.
- **연구소 적용 아이디어:** 상대별 기록이 실제 개선을 주는지, 과적합인지 구분하는 실험 설계에 유용하다.
- **확인 수준:** 원문 소속·방법·실험 게임 확인; 정식 출판 확인 못함
- **재현 자료:** 원문 부록에 상대 정책과 평가 설정; 전체 구현 재현 미수행
- **원문:** https://arxiv.org/html/2605.09150v1

## R05 · ICM은 실제 대회 결과를 얼마나 잘 설명할까? (2025)

Empirical Validation of the Independent Chip Model

- **저자:** Juho Kim
- **기관:** Carnegie Mellon University (논문 표기)
- **지역:** 미국
- **출판:** IEEE Conference on Games 2025 · short paper
- **상태:** 심사 논문
- **게임 범위:** 실제 대회 종료일 칩 스냅샷
- **쉬운 요약:** ICM은 비교 기준보다 정확했지만 큰 스택의 성과를 낮게, 숏스택의 성과를 높게 평가하는 경향이 있었다.
- **방법과 근거:** 수집 전체는 1만여 이벤트 규모지만 실제 검증 표본은 2,500개 종료일 스냅샷과 33,478명이다. 둘을 같은 표본 수로 쓰면 안 된다.
- **한계:** 관측자료이므로 실력·선택효과와 스택 효과를 분리한 인과 추정은 아니다. 결과만으로 모든 숏스택 콜 범위를 넓힐 수 없다.
- **연구소 적용 아이디어:** 우리 ICM 계산기의 한계 설명과 스택 구간별 예측 오차 검증에 직접 관련된다.
- **확인 수준:** 원문 데이터·소속 확인; arXiv 기록의 CoG 게재와 DOI 확인
- **재현 자료:** Zenodo 데이터: https://zenodo.org/records/15556774 ; 직접 재분석 미수행
- **원문:** https://arxiv.org/html/2506.00180v2

## R06 · LLM 포커 판단을 시험하는 문제은행 (2025)

PokerBench: Training Large Language Models to Become Professional Poker Players

- **저자:** Richard Zhuang · Akshat Gupta · Richard Yang · Aniket Rahane · Zhengyu Li · Gopala Anumanchipalli
- **기관:** UC Berkeley · Georgia Institute of Technology
- **지역:** 미국
- **출판:** AAAI 2025
- **상태:** 심사 논문
- **게임 범위:** NLHE 의사결정 문제 · 모델 간 대전
- **쉬운 요약:** 11,000개 상황으로 LLM의 선택을 평가한다. 평가 당시 모델들은 약점을 보였고 미세조정 후 개선됐다.
- **방법과 근거:** 프리플랍 1,000개·포스트플랍 10,000개 문제와 일부 모델 간 대전을 활용한다.
- **한계:** 문제 정답률은 전체 전략의 exploitability나 대회 수익률과 다르다. 당시 모델 결과를 2026년 모든 모델에 일반화하지 않는다.
- **연구소 적용 아이디어:** Opus 등 모델의 설명을 그대로 믿지 말고 고정된 검증 문제와 대전 성과를 분리 측정한다.
- **확인 수준:** 학회 PDF 서지·소속 및 arXiv 전문 평가 설계 확인
- **재현 자료:** https://github.com/pokerllm/pokerbench · 코드와 데이터 공개 표기; 재실행 미수행
- **원문:** https://ojs.aaai.org/index.php/AAAI/article/download/34814/36969

## R07 · 체스와 포커를 함께 다루는 학습 원리 (2023)

Student of Games: A unified learning algorithm for both perfect and imperfect information games

- **저자:** Martin Schmid 외
- **기관:** Google DeepMind · University of Alberta · EquiLibre 외
- **지역:** 캐나다·체코·국제
- **출판:** Science Advances 9, eadg3256
- **상태:** 심사 논문
- **게임 범위:** 체스 · 바둑 · HUNL · Scotland Yard
- **쉬운 요약:** 공개된 판에서 싸우는 게임과 상대 정보가 숨겨진 게임을 하나의 학습·탐색 틀로 다룬다. 포커는 이 방법의 주요 시험대다.
- **방법과 근거:** 탐색·학습·게임이론을 결합하고 여러 종류의 게임에서 평가한다.
- **한계:** 강한 공개 포커 에이전트 상대 결과가 모든 프로나 다인 토너먼트 상대 우월성을 뜻하지 않는다.
- **연구소 적용 아이디어:** 옵션 트리 프로젝트에 탐색과 가치 추정을 결합하는 후속 설계로 읽는다.
- **확인 수준:** 출판 서지·저자 소속·초록 확인; 보충자료 재현 미완료
- **재현 자료:** 코드·데이터 공개 여부는 이번 검토에서 확인하지 못함
- **원문:** https://doi.org/10.1126/sciadv.adg3256

## R08 · 빠르게 판단하는 강화학습 포커 AI (2022)

AlphaHoldem: High-Performance Artificial Intelligence for Heads-Up No-Limit Poker via End-to-End Reinforcement Learning

- **저자:** Enmin Zhao · Renye Yan · Jinqiu Li · Kai Li · Junliang Xing
- **기관:** Chinese Academy of Sciences · UCAS · Tsinghua University
- **지역:** 중국
- **출판:** AAAI 2022
- **상태:** 심사 논문
- **게임 범위:** Heads-up no-limit Hold’em
- **쉬운 요약:** 대규모 탐색에만 의존하지 않고 강화학습 정책으로 빠르게 행동하는 접근을 제시한다.
- **방법과 근거:** 헤즈업 대전 성과와 계산 효율을 보고하고 핸드 이력 공개를 안내한다.
- **한계:** 추론 속도와 전략 정확도는 별개다. 하드웨어·학습 비용·상대와 표본을 맞추지 않은 속도 비교는 주의한다.
- **연구소 적용 아이디어:** RTX 기반 연구에서는 학습 비용과 한 번의 판단 비용을 나눠 기록할 필요가 있다.
- **확인 수준:** 학회 검색 기록 확인; 출판사 본문 직접 접근 제한
- **재현 자료:** 저자 논문에서 대전 이력 공개를 안내; 전체 학습 코드 공개와 구분
- **원문:** https://doi.org/10.1609/aaai.v36i4.20394

## R09 · 믿음의 분포를 갱신하며 미래를 탐색하기 (2020)

Combining Deep Reinforcement Learning and Search for Imperfect-Information Games

- **저자:** Noam Brown · Anton Bakhtin · Adam Lerer · Qucheng Gong
- **기관:** Facebook AI Research
- **지역:** 미국·산업 연구
- **출판:** NeurIPS 2020 · ReBeL
- **상태:** 심사 논문
- **게임 범위:** 2인 제로섬 · HUNL
- **쉬운 요약:** 같은 보드라도 상대가 어떤 패를 가졌을지에 대한 믿음이 다르면 가치가 달라진다. ReBeL은 이를 학습과 탐색에 결합한다.
- **방법과 근거:** 2인 제로섬 모형의 수렴 분석과 불완전정보 게임 실험을 제시한다.
- **한계:** 이론의 가정과 근사 구현을 구분해야 한다. 다인 토너먼트 상금 최적화를 직접 해결하지 않는다.
- **연구소 적용 아이디어:** 단순 카드 트리에서 정보 집합·레인지 분포를 가진 계속 참여 가치 모형으로 확장한다.
- **확인 수준:** 학회 기록·저자·초록 확인
- **재현 자료:** 공개 구현 범위와 전체 포커 시스템 공개를 구별; 이번 재현 미수행
- **원문:** https://arxiv.org/abs/2007.13544

## R10 · 여섯 명 포커에서 프로와 경쟁한 AI (2019)

Superhuman AI for multiplayer poker

- **저자:** Noam Brown · Tuomas Sandholm
- **기관:** Carnegie Mellon University · Facebook AI 협업
- **지역:** 미국
- **출판:** Science · Pluribus
- **상태:** 심사 논문
- **게임 범위:** 6인 no-limit Hold’em
- **쉬운 요약:** 다섯 상대가 있는 포커에서도 AI가 전문 선수들과 경쟁할 수 있음을 보여준 대표 연구다.
- **방법과 근거:** 셀프플레이로 전략을 만들고 프로 선수들과의 대전으로 평가했다.
- **한계:** 사람 상대 우수한 성과는 게임 전체의 해 또는 모든 상대에 대한 불패 증명이 아니다. ICM 대회 차트로 직접 변환할 수 없다.
- **연구소 적용 아이디어:** 다인 환경에서 2인 게임의 이론 보장을 그대로 가져오지 않도록 읽는다.
- **확인 수준:** Science 서지·초록 및 CMU 발표 확인
- **재현 자료:** 코드·데이터 공개 여부는 이번 검토에서 확인하지 못함
- **원문:** https://doi.org/10.1126/science.aay2400

## R11 · 운이 섞인 포커 성적을 더 정확하게 평가하기 (2018)

AIVAT: A New Variance Reduction Technique for Agent Evaluation in Imperfect Information Games

- **저자:** Neil Burch · Martin Schmid · Matej Moravčík · Dustin Morrill · Michael Bowling
- **기관:** University of Alberta 연구진
- **지역:** 캐나다
- **출판:** AAAI 2018
- **상태:** 심사 논문
- **게임 범위:** 불완전정보 게임 성과 평가
- **쉬운 요약:** 적은 경기로 실력을 비교하려면 카드 운과 알려진 행동 확률에서 생기는 흔들림을 줄여야 한다. AIVAT은 이를 위한 평가 도구다.
- **방법과 근거:** 가치 추정과 일부 선수의 알려진 전략을 이용하는 불편 추정량을 제시한다.
- **한계:** 상대의 모든 전략을 모르는 임의의 핸드 로그에 곧바로 적용하는 만능 보정식은 아니다.
- **연구소 적용 아이디어:** 새 전략을 비교할 때 단순 승률만이 아니라 신뢰구간과 분산 감소 설계를 추가한다.
- **확인 수준:** 공식 연구그룹의 학회 서지·초록 확인
- **재현 자료:** 코드·데이터 공개 여부는 이번 검토에서 확인하지 못함
- **원문:** https://poker.cs.ualberta.ca/publications.html

## R12 · 매 순간 다시 계산하는 포커 전략 (2017)

DeepStack: Expert-Level Artificial Intelligence in Heads-Up No-Limit Poker

- **저자:** Matej Moravčík 외
- **기관:** University of Alberta · Charles University · Czech Technical University
- **지역:** 캐나다·체코
- **출판:** Science
- **상태:** 심사 논문
- **게임 범위:** Heads-up no-limit Hold’em
- **쉬운 요약:** 끝까지 모든 미래를 펼치는 대신 현재 상황을 다시 풀고 먼 미래의 가치를 학습으로 추정한다.
- **방법과 근거:** continual re-solving과 가치 추정, 전문가 상대 실험을 결합한다.
- **한계:** 헤즈업 조건과 실험 표본의 결과다. 다인 파이널테이블 전략을 검증한 것은 아니다.
- **연구소 적용 아이디어:** 플랍 콜 이후 턴·리버의 선택권을 가치화하는 프로젝트에 직접적인 방법론 참고다.
- **확인 수준:** 원문 서지·초록 및 대학 발표 확인
- **재현 자료:** 코드·데이터 공개 여부는 이번 검토에서 확인하지 못함
- **원문:** https://poker.cs.ualberta.ca/publications/17science.pdf

## R13 · 포커 실력은 다음 기간에도 이어지는가? (2015)

Beyond Chance? The Persistence of Performance in Online Poker

- **저자:** Rogier J. D. Potter van Loon · Martijn J. van den Assem · Dennie van Dolder
- **기관:** Erasmus University Rotterdam · VU Amsterdam · University of Nottingham
- **지역:** 네덜란드·영국
- **출판:** PLOS ONE
- **상태:** 심사 논문
- **게임 범위:** 온라인 현금게임 관측자료
- **쉬운 요약:** 앞서 잘한 선수는 다음 기간에도 상대적으로 잘하는 경향이 있었다. 포커에 지속적인 실력 요소가 있다는 증거다.
- **방법과 근거:** 대규모 player-hand 관측의 성과 지속성과 회귀·시뮬레이션을 분석한다.
- **한계:** 연구의 1,500핸드 결과는 특정 모형과 기준에 따른다. 개인 승률 확정이나 토너먼트 표본 기준으로 쓰지 않는다.
- **연구소 적용 아이디어:** 뱅크롤 기록에서 단기 성과와 실력 추정의 불확실성을 분리한다.
- **확인 수준:** 출판사 전문의 초록·소속·자료 설명 확인
- **재현 자료:** 코드·데이터 공개 여부는 이번 검토에서 확인하지 못함
- **원문:** https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0115479
