import "./trip.css";

export const metadata = {
  metadataBase: new URL("https://eatplaypoker.vercel.app"),
  title: "VietnamPokerTrip · 하노이 포커 여행",
  description: "하노이 포커 여행을 위한 전략 노트, 2026 QPC 일정과 바이인, 베트남 문화 가이드. 출국 전 연습은 Holdem Lab에서.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "VietnamPokerTrip · 하노이 포커 여행",
    description: "QPC Winter 2026 일정·바이인 비교, Royal City 숙소 동선, 포커 전략 노트와 Holdem Lab.",
    url: "https://eatplaypoker.vercel.app",
    siteName: "VietnamPokerTrip",
    locale: "ko_KR",
    type: "website"
  }
};

export const viewport = { themeColor: "#142520" };

export default function TripLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
