"use client";

import { useMemo, useState } from "react";
import { EVENTS, conflictNotes } from "@/lib/trip-events";

const number = new Intl.NumberFormat("ko-KR");
const dong = (millions) => number.format(Math.round(millions * 1_000_000)) + "동";

export default function EventSelector() {
  const [scope, setScope] = useState("fit");
  const [cap, setCap] = useState("Infinity");
  const [sort, setSort] = useState("date");
  const [rate, setRate] = useState("55");
  const [selected, setSelected] = useState(() => new Set());

  const conversion = Number(rate);
  const rateOk = rate !== "" && Number.isFinite(conversion) && conversion >= 1 && conversion <= 999;
  const won = (millions) => (rateOk ? "약 " + number.format(Math.round(millions * 1000 * conversion)) + "원" : "");

  const visible = useMemo(() => {
    const list = EVENTS.filter((e) => {
      const matchesScope = scope === "all" || (scope === "excluded") === Boolean(e.excluded);
      return matchesScope && e.price <= Number(cap);
    });
    if (sort === "price") list.sort((a, b) => a.price - b.price);
    return list;
  }, [scope, cap, sort]);

  const toggle = (id, on) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const total = EVENTS.reduce((sum, e) => (selected.has(e.id) ? sum + e.price : sum), 0);
  const notes = [selected.size ? `${selected.size}개 경기. 재진입·여행 비용 별도.` : "경기를 선택해 바이인 합계를 비교하세요.", ...conflictNotes(selected)];

  return (
    <>
      <div className="controls">
        <label>
          참가 범위
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="fit">귀국 전 주요 후보</option>
            <option value="all">전체 주요 경기</option>
            <option value="excluded">귀국·출국 일정과 충돌</option>
          </select>
        </label>
        <label>
          바이인 상한
          <select value={cap} onChange={(e) => setCap(e.target.value)}>
            <option value="Infinity">전체</option>
            <option value="12">1,200만 동 이하</option>
            <option value="25">2,500만 동 이하</option>
            <option value="60">6,000만 동 이하</option>
          </select>
        </label>
        <label>
          정렬
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">시작 날짜</option>
            <option value="price">낮은 바이인순</option>
          </select>
        </label>
        <label>
          1,000동당 원화 (가정)
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} min="1" max="999" step="0.1" inputMode="decimal" />
        </label>
      </div>
      <div className="event-list">
        {visible.length ? (
          visible.map((e) => (
            <article className="event" key={e.id}>
              <div className="event-date">12.{e.day}</div>
              <div className="event-name">
                <strong>
                  {e.name} <span className="muted">#{e.id}</span>
                </strong>
                <small>{e.label}</small>
              </div>
              <div className="event-time">
                {e.time}
                <small>{e.final}</small>
              </div>
              <div className="event-price">
                <strong>{dong(e.price)}</strong>
                <small>{won(e.price)}</small>
                <small>보장 {dong(e.guarantee)}</small>
              </div>
              <div className="event-action">
                {e.excluded ? (
                  <span className="excluded">이번 여행 제외</span>
                ) : (
                  <label className="pick">
                    <input
                      type="checkbox"
                      checked={selected.has(e.id)}
                      onChange={(ev) => toggle(e.id, ev.target.checked)}
                      aria-label={`${e.name} ${e.id} 예산에 추가`}
                    />
                    담기
                  </label>
                )}
              </div>
            </article>
          ))
        ) : (
          <p className="empty">이 조건에 해당하는 경기가 없습니다.</p>
        )}
      </div>
      <div className="budget" aria-live="polite">
        <div>
          <small>선택한 경기 · 각 1회 기준</small>
          <strong>
            {dong(total)}
            {total && won(total) ? " · " + won(total) : ""}
          </strong>
          <p>{notes.join(" ")}</p>
        </div>
        <button type="button" onClick={() => setSelected(new Set())}>
          선택 해제
        </button>
      </div>
    </>
  );
}
