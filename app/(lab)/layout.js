import "./globals.css";
import "./lounge.css";
import "./live.css";
import "./practice.css";
import Providers from "@/components/Providers";

export const metadata = {
  metadataBase: new URL("https://vietnampokertrip.vercel.app"),
  title: "Holdem Lab · VietnamPokerTrip",
  description: "하노이 포커 여행 전후로 GTO를 연습하는 트레이닝 랩. PokerBench 솔버 스팟 기반 드릴·핸드 랩·라이브 테이블.",
  icons: { icon: "/favicon.svg" }
};

export default function LabLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
