// QPC Winter 2026 event data for the VietnamPokerTrip event selector.
// price / guarantee are in millions of VND. Checked 2026-11-10 (Hanoi time).
export const EVENTS = [
  { id: 7, day: 13, name: "Kick Off", price: 6.6, guarantee: 8000, time: "12/13–14 예선", final: "12/15 11:30 파이널", label: "예선 불가", excluded: true },
  { id: 13, day: 14, name: "QPC Heater", price: 5.5, guarantee: 500, time: "12/14 11:30", final: "싱글데이", label: "도착 전", excluded: true },
  { id: 19, day: 15, name: "QPC Cup", price: 22, guarantee: 15000, time: "15일 11:00 · 16·17일 10:30/17:00", final: "12/18 12:00 파이널", label: "주력 · 5개 플라이트" },
  { id: 20, day: 15, name: "QPC Supreme", price: 8.8, guarantee: 800, time: "12/15", final: "상세 시간은 전체 일정 참고", label: "일반 사이드" },
  { id: 22, day: 15, name: "Megastack Turbo", price: 3.4, guarantee: 150, time: "12/15", final: "상세 시간은 전체 일정 참고", label: "도착일 저가 후보" },
  { id: 27, day: 16, name: "High Roller · Golden Wings", price: 55, guarantee: 2500, time: "12/16 12:30", final: "12/17 12:00 파이널", label: "멀티데이 하이롤러" },
  { id: 29, day: 16, name: "Mini High Roller", price: 11, guarantee: 300, time: "12/16 18:30", final: "싱글데이", label: "저녁 사이드" },
  { id: 37, day: 18, name: "Main Event", price: 33, guarantee: 25000, time: "12/18–20 예선", final: "12/21 Day 2 · 12/22 Day 3", label: "파이널이 귀국 이후", excluded: true },
  { id: 38, day: 18, name: "QPC Classic", price: 7.7, guarantee: 700, time: "12/18 11:30", final: "싱글데이", label: "Cup 파이널 불참 시" },
  { id: 39, day: 18, name: "Super High Roller · Prestige", price: 109, guarantee: 3000, time: "12/18 시작", final: "12/19 11:00 파이널", label: "고액 · 이틀 필요" },
  { id: 41, day: 18, name: "Mini High Roller", price: 11, guarantee: 300, time: "12/18 18:30", final: "싱글데이", label: "저녁 사이드" },
  { id: 44, day: 19, name: "QPC Unity", price: 6.6, guarantee: 600, time: "12/19 11:30", final: "싱글데이", label: "낮은 지출 후보" },
  { id: 45, day: 19, name: "High Roller · Single Day", price: 44, guarantee: 2000, time: "12/19 12:30", final: "싱글데이 · 종료·지급 시각 확인", label: "귀국 전 지급 확인" },
  { id: 50, day: 20, name: "QPC Signature", price: 11, guarantee: 1000, time: "12/20 귀국일", final: "공항 이동과 충돌", label: "귀국일", excluded: true },
  { id: 55, day: 21, name: "Mini Main Event", price: 11, guarantee: 10000, time: "12/21–23", final: "12/23 파이널", label: "귀국 이후", excluded: true }
];

export function conflictNotes(selected) {
  const notes = [];
  if (selected.has(19) && selected.has(38)) notes.push("Cup 파이널과 Classic 시작이 겹칩니다.");
  if (selected.has(19) && selected.has(27)) notes.push("Golden Wings 진출 시 17일 Cup 플라이트와 충돌할 수 있습니다.");
  if (selected.has(39) && (selected.has(44) || selected.has(45))) notes.push("Prestige 파이널은 19일 사이드 경기와 겹칠 수 있습니다.");
  if (selected.has(44) && selected.has(45)) notes.push("Unity와 19일 하이롤러의 시작은 1시간 차이입니다.");
  return notes;
}
