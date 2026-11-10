import Link from "next/link";
import { SECTIONS } from "@/lib/sections";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer-inner">
        <Link className="site-brand" href="/">
          <span aria-hidden="true">♠</span> VietnamPokerTrip
        </Link>
        <nav aria-label="바닥글 메뉴">
          {SECTIONS.map(([href, , label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <p>Hà Nội · 일정은 2026년 11월 10일 확인 기준 · 연구소 기록은 이 브라우저에만 저장되며 칩은 플레이 머니입니다.</p>
      </div>
    </footer>
  );
}
