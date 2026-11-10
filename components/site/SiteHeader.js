"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/lib/sections";

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const active = (href) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <header className="site-header">
      <div className="wrap site-bar">
        <Link className="site-brand" href="/">
          <span aria-hidden="true">♠</span> VietnamPokerTrip
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          {SECTIONS.map(([href, num, label]) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
              <span>{num}</span> {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
